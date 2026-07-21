import { pgTable, varchar, text, index } from "drizzle-orm/pg-core";
import { id, createdAt, updatedAt, deletedAt, isActive, version } from "../common.js";

/**
 * permissions table — granular capability flags.
 * e.g. "users:read", "products:write", "orders:delete"
 */
export const permissions = pgTable(
  "permissions",
  {
    id,
    name: varchar("name", { length: 150 }).notNull().unique(),
    slug: varchar("slug", { length: 150 }).notNull().unique(),
    resource: varchar("resource", { length: 100 }).notNull(),
    action: varchar("action", { length: 50 }).notNull(),
    description: text("description"),
    isActive,
    version,
    createdAt,
    updatedAt,
    deletedAt,
  },
  (table) => [
    index("permissions_slug_idx").on(table.slug),
    index("permissions_resource_idx").on(table.resource),
  ]
);
