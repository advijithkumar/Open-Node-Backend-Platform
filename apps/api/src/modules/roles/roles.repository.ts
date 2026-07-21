import { eq, and, isNull } from "drizzle-orm";
import { db } from "../../core/database/db.js";
import { roles } from "../../core/database/schema/onbp/role.schema.js";

export interface CreateRoleData {
  name: string;
  slug: string;
  description?: string;
}

export class RoleRepository {
  async findById(id: string) {
    const result = await db
      .select()
      .from(roles)
      .where(and(eq(roles.id, id), isNull(roles.deletedAt)))
      .limit(1);
    return result[0];
  }

  async findBySlug(slug: string) {
    const result = await db
      .select()
      .from(roles)
      .where(and(eq(roles.slug, slug), isNull(roles.deletedAt)))
      .limit(1);
    return result[0];
  }

  async findAll(limit = 50, offset = 0) {
    return db
      .select()
      .from(roles)
      .where(isNull(roles.deletedAt))
      .limit(limit)
      .offset(offset);
  }

  async create(data: Record<string, unknown>) {
    const result = await db.insert(roles).values(data as typeof roles.$inferInsert).returning();
    return result[0];
  }

  async update(id: string, data: Record<string, unknown>) {
    const result = await db
      .update(roles)
      .set({ ...data, updatedAt: new Date() } as Partial<typeof roles.$inferInsert>)
      .where(and(eq(roles.id, id), isNull(roles.deletedAt)))
      .returning();
    return result[0];
  }

  async softDelete(id: string) {
    const result = await db
      .update(roles)
      .set({ deletedAt: new Date(), isActive: false })
      .where(and(eq(roles.id, id), isNull(roles.deletedAt)))
      .returning();
    return result.length > 0;
  }
}
