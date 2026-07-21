import { eq, and, isNull } from "drizzle-orm";
import { db } from "../../core/database/db.js";
import { permissions } from "../../core/database/schema/onbp/permission.schema.js";

export class PermissionRepository {
  async findById(id: string) {
    const result = await db
      .select()
      .from(permissions)
      .where(and(eq(permissions.id, id), isNull(permissions.deletedAt)))
      .limit(1);
    return result[0];
  }

  async findBySlug(slug: string) {
    const result = await db
      .select()
      .from(permissions)
      .where(and(eq(permissions.slug, slug), isNull(permissions.deletedAt)))
      .limit(1);
    return result[0];
  }

  async findAll(limit = 100, offset = 0) {
    return db
      .select()
      .from(permissions)
      .where(isNull(permissions.deletedAt))
      .limit(limit)
      .offset(offset);
  }

  async create(data: Record<string, unknown>) {
    const result = await db
      .insert(permissions)
      .values(data as typeof permissions.$inferInsert)
      .returning();
    return result[0];
  }

  async update(id: string, data: Record<string, unknown>) {
    const result = await db
      .update(permissions)
      .set({ ...data, updatedAt: new Date() } as Partial<typeof permissions.$inferInsert>)
      .where(and(eq(permissions.id, id), isNull(permissions.deletedAt)))
      .returning();
    return result[0];
  }

  async softDelete(id: string) {
    const result = await db
      .update(permissions)
      .set({ deletedAt: new Date(), isActive: false })
      .where(and(eq(permissions.id, id), isNull(permissions.deletedAt)))
      .returning();
    return result.length > 0;
  }
}
