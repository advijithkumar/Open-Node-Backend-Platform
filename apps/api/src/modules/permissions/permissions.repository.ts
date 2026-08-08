import { eq, and, isNull, inArray } from "drizzle-orm";
import { BaseRepository } from "../../core/database/base.repository.js";
import { permissions } from "./permissions.schema.js";
import { db } from "../../core/database/db.js";
import type { PermissionRecord } from "./permissions.types.js";

export class PermissionRepository extends BaseRepository<typeof permissions> {
  constructor() {
    super(permissions);
  }

  async findByName(nameVal: string): Promise<PermissionRecord | undefined> {
    const results = await db
      .select()
      .from(this.table)
      .where(and(eq(permissions.name, nameVal), isNull(permissions.deletedAt)))
      .limit(1);

    return results[0] as unknown as PermissionRecord | undefined;
  }

  async findBySlug(slugVal: string): Promise<PermissionRecord | undefined> {
    const results = await db
      .select()
      .from(this.table)
      .where(and(eq(permissions.slug, slugVal), isNull(permissions.deletedAt)))
      .limit(1);

    return results[0] as unknown as PermissionRecord | undefined;
  }

  async findPermissionById(idVal: string): Promise<PermissionRecord | undefined> {
    const record = await this.findById(idVal);
    return record as unknown as PermissionRecord;
  }

  async findPermissionsByIds(ids: string[]): Promise<PermissionRecord[]> {
    if (!ids || ids.length === 0) return [];

    const results = await db
      .select()
      .from(this.table)
      .where(and(inArray(permissions.id, ids), isNull(permissions.deletedAt)));

    return results as unknown as PermissionRecord[];
  }

  async findAllPermissions(limit = 100, offset = 0): Promise<PermissionRecord[]> {
    const results = await this.findAll(limit, offset);
    return results as unknown as PermissionRecord[];
  }

  async createPermission(data: { name: string; slug: string; resource: string; action: string; description?: string; isSystem?: boolean }): Promise<PermissionRecord> {
    const record = await this.create(data as Record<string, unknown>);
    return record as unknown as PermissionRecord;
  }

  async updatePermission(idVal: string, data: { name?: string; slug?: string; description?: string }): Promise<PermissionRecord> {
    const record = await this.update(idVal, data as Record<string, unknown>);
    return record as unknown as PermissionRecord;
  }

  async deletePermission(idVal: string): Promise<boolean> {
    return this.softDelete(idVal);
  }

  async restore(idVal: string): Promise<PermissionRecord> {
    const results = await db
      .update(this.table)
      .set({ deletedAt: null, isActive: true, updatedAt: new Date() })
      .where(eq(permissions.id, idVal))
      .returning();

    return results[0] as unknown as PermissionRecord;
  }
}
export default PermissionRepository;
