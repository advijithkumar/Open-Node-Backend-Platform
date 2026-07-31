import { pgTable, varchar } from "drizzle-orm/pg-core";
import { id, createdAt, updatedAt, deletedAt, isActive, version } from "../../core/database/schema/common.js";

export const settingsTable = pgTable("settings", {
  id,
  key: varchar("key", { length: 255 }).notNull().unique(),
  value: varchar("value", { length: 2000 }).notNull(),
  description: varchar("description", { length: 255 }),
  isActive,
  version,
  createdAt,
  updatedAt,
  deletedAt,
});
