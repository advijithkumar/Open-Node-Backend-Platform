import type { Request, Response, NextFunction } from "express";
import { auth } from "./better-auth.js";
import { AppError } from "../errors/app-error.js";
import { container } from "../container/container.js";
import type { AuthorizationService } from "./authorization.service.js";

export interface AuthenticatedRequest extends Request {
  user?: typeof auth.$Infer.Session.user;
  session?: typeof auth.$Infer.Session.session;
}

export function requireAuth() {
  return async (req: AuthenticatedRequest, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const session = await auth.api.getSession({
        headers: req.headers,
      });

      if (!session) {
        throw new AppError("Authentication required", 401, "UNAUTHORIZED");
      }

      req.user = session.user;
      req.session = session.session;
      next();
    } catch (err) {
      next(err);
    }
  };
}

export function requireRole(role: string) {
  return async (req: AuthenticatedRequest, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError("Authentication required", 401, "UNAUTHORIZED");
      }

      const authService = container.resolve<AuthorizationService>("authorizationService");
      authService.registerGuard(`requireRole:${role}`);
      authService.incrementProtectedRouteCount();

      const userRole = (req.user as Record<string, any>).role || "guest";
      const hasAccess = await authService.hasRole(userRole, role);
      if (!hasAccess) {
        throw new AppError("Access forbidden: insufficient role permissions", 403, "FORBIDDEN");
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}

export function requirePermission(permission: string) {
  return async (req: AuthenticatedRequest, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError("Authentication required", 401, "UNAUTHORIZED");
      }

      const authService = container.resolve<AuthorizationService>("authorizationService");
      authService.registerGuard(`requirePermission:${permission}`);
      authService.incrementProtectedRouteCount();

      const userRole = (req.user as Record<string, any>).role || "guest";
      const hasAccess = await authService.hasPermission(req.user.id, userRole, permission);
      if (!hasAccess) {
        throw new AppError("Access forbidden: missing required permission", 403, "FORBIDDEN");
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}
