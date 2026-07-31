import { eq, and, isNull } from "drizzle-orm";
import { BaseRepository } from "../../core/database/base.repository.js";
import { roles, rolePermissions } from "./roles.schema.js";
import { permissions } from "../permissions/permissions.schema.js";
import { db } from "../../core/database/db.js";
import type { RoleRecord } from "./roles.types.js";

export class RoleRepository extends BaseRepository<typeof roles> {
  constructor() {
    super(roles);
  }

  async findByName(nameVal: string): Promise<RoleRecord | undefined> {
    const results = await db
      .select()
      .from(this.table)
      .where(and(eq(roles.name, nameVal), isNull(roles.deletedAt)))
      .limit(1);

    return results[0] as RoleRecord | undefined;
  }

  async findBySlug(slugVal: string): Promise<RoleRecord | undefined> {
    const results = await db
      .select()
      .from(this.table)
      .where(and(eq(roles.slug, slugVal), isNull(roles.deletedAt)))
      .limit(1);

    return results[0] as RoleRecord | undefined;
  }

  async findRoleById(idVal: string): Promise<RoleRecord | undefined> {
    const record = await this.findById(idVal);
    return record as unknown as RoleRecord;
  }

  async findAllRoles(limit = 50, offset = 0): Promise<RoleRecord[]> {
    const results = await this.findAll(limit, offset);
    return results as unknown as RoleRecord[];
  }

  async createRole(data: { name: string; slug: string; description?: string; isSystem?: boolean }): Promise<RoleRecord> {
    const record = await this.create(data as Record<string, unknown>);
    return record as unknown as RoleRecord;
  }

  async updateRole(idVal: string, data: { name?: string; slug?: string; description?: string }): Promise<RoleRecord> {
    const record = await this.update(idVal, data as Record<string, unknown>);
    return record as unknown as RoleRecord;
  }

  async deleteRole(idVal: string): Promise<boolean> {
    return this.softDelete(idVal);
  }

  async restore(idVal: string): Promise<RoleRecord> {
    const results = await db
      .update(this.table)
      .set({ deletedAt: null, isActive: true, updatedAt: new Date() })
      .where(eq(roles.id, idVal))
      .returning();

    return results[0] as unknown as RoleRecord;
  }

  // Junction relationship query operations
  async assignPermission(roleId: string, permissionId: string): Promise<void> {
    await db.insert(rolePermissions).values({ roleId, permissionId });
  }

  async removePermission(roleId: string, permissionId: string): Promise<boolean> {
    const results = await db
      .delete(rolePermissions)
      .where(and(eq(rolePermissions.roleId, roleId), eq(rolePermissions.permissionId, permissionId)))
      .returning();
    return results.length > 0;
  }

  async getRolePermissions(roleId: string): Promise<any[]> {
    return db
      .select({
        id: permissions.id,
        name: permissions.name,
        slug: permissions.slug,
        resource: permissions.resource,
        action: permissions.action,
        description: permissions.description,
        isActive: permissions.isActive,
        createdAt: permissions.createdAt,
      })
      .from(rolePermissions)
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(eq(rolePermissions.roleId, roleId));
  }

  async getPermissionRoles(permissionId: string): Promise<any[]> {
    return db
      .select({
        id: roles.id,
        name: roles.name,
        slug: roles.slug,
        description: roles.description,
        isSystem: roles.isSystem,
        isActive: roles.isActive,
        createdAt: roles.createdAt,
      })
      .from(rolePermissions)
      .innerJoin(roles, eq(rolePermissions.roleId, roles.id))
      .where(eq(rolePermissions.permissionId, permissionId));
  }

  async replacePermissions(roleId: string, permissionIds: string[]): Promise<void> {
    await db.transaction(async (tx) => {
      await tx.delete(rolePermissions).where(eq(rolePermissions.roleId, roleId));
      if (permissionIds.length > 0) {
        await tx.insert(rolePermissions).values(
          permissionIds.map((permissionId) => ({ roleId, permissionId }))
        );
      }
    });
  }
}
export default RoleRepository;
