import { eq } from "drizzle-orm";
import { db } from "../../core/database/db.js";
import { settings } from "../../core/database/schema/onbp/setting.schema.js";

export class SettingRepository {
  async findByKey(key: string) {
    const result = await db
      .select()
      .from(settings)
      .where(eq(settings.key, key))
      .limit(1);
    return result[0];
  }

  async findAll(group?: string) {
    if (group) {
      return db.select().from(settings).where(eq(settings.group, group));
    }
    return db.select().from(settings);
  }

  async upsert(key: string, value: unknown, description?: string, group?: string) {
    const existing = await this.findByKey(key);
    if (existing) {
      const result = await db
        .update(settings)
        .set({ value, updatedAt: new Date() })
        .where(eq(settings.key, key))
        .returning();
      return result[0];
    }
    const result = await db
      .insert(settings)
      .values({ key, value, description, group } as typeof settings.$inferInsert)
      .returning();
    return result[0];
  }

  async delete(key: string) {
    const result = await db.delete(settings).where(eq(settings.key, key)).returning();
    return result.length > 0;
  }
}
