import { pgTable, varchar } from "drizzle-orm/pg-core";
import { id, createdAt, updatedAt, deletedAt, isActive, version } from "../../core/database/schema/common.js";

export const authModuleTable = pgTable("auth-module", {
  id,
  name: varchar("name", { length: 255 }).notNull(),
  isActive,
  version,
  createdAt,
  updatedAt,
  deletedAt,
});
