import type { Request, Response, NextFunction } from "express";
import { eq } from "drizzle-orm";
import { db } from "../database/db.js";
import { userRoles, rolePermissions } from "../database/schema/onbp/rbac.schema.js";
import { permissions } from "../database/schema/onbp/permission.schema.js";
import { roles } from "../database/schema/onbp/role.schema.js";
import { AppError } from "../errors/app-error.js";

interface AuthenticatedRequest extends Request {
  user?: { id: string; [key: string]: unknown };
}

/**
 * RBAC middleware factory.
 * Verifies the authenticated user has a specific permission by slug.
 *
 * @example
 * router.delete("/:id", requirePermission("users:delete"), handler);
 */
export function requirePermission(permissionSlug: string) {
  return async (req: AuthenticatedRequest, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError("Unauthorized — no authenticated user", 401, "UNAUTHORIZED");
      }

      // Join: user_roles → role_permissions → permissions
      // Check if any permission slug matches for the user's assigned roles
      const allowed = await db
        .select({ slug: permissions.slug })
        .from(userRoles)
        .innerJoin(userRoles, eq(userRoles.roleId, rolePermissions.roleId))
        .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
        .where(eq(userRoles.userId, userId))
        .then((rows) => rows.some((r) => r.slug === permissionSlug));

      if (!allowed) {
        throw new AppError(
          `Forbidden — missing permission: ${permissionSlug}`,
          403,
          "PERMISSION_DENIED"
        );
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}

/**
 * RBAC middleware factory by role slug.
 * Verifies the authenticated user has at least one of the specified roles.
 *
 * @example
 * router.get("/admin-panel", requireRole("admin", "super-admin"), handler);
 */
export function requireRole(...roleSlugs: string[]) {
  return async (req: AuthenticatedRequest, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError("Unauthorized — no authenticated user", 401, "UNAUTHORIZED");
      }

      const userRoleRows = await db
        .select({ slug: roles.slug })
        .from(userRoles)
        .innerJoin(roles, eq(userRoles.roleId, roles.id))
        .where(eq(userRoles.userId, userId));

      const hasRole = userRoleRows.some((r) => roleSlugs.includes(r.slug));

      if (!hasRole) {
        throw new AppError(
          `Forbidden — requires one of: [${roleSlugs.join(", ")}]`,
          403,
          "ROLE_REQUIRED"
        );
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}
