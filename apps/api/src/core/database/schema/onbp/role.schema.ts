import { pgTable, varchar, text, index } from "drizzle-orm/pg-core";
import { id, createdAt, updatedAt, deletedAt, isActive, version } from "../common.js";

/**
 * roles table — system and custom roles.
 */
export const roles = pgTable(
  "roles",
  {
    id,
    name: varchar("name", { length: 100 }).notNull().unique(),
    slug: varchar("slug", { length: 100 }).notNull().unique(),
    description: text("description"),
    isSystem: isActive, // re-uses boolean column semantics
    isActive,
    version,
    createdAt,
    updatedAt,
    deletedAt,
  },
  (table) => [index("roles_slug_idx").on(table.slug)]
);
