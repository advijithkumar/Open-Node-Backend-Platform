import { pgTable, text, varchar, jsonb, index } from "drizzle-orm/pg-core";
import { id, createdAt, updatedAt } from "../common.js";

/**
 * settings table — key/value application configuration store.
 * Supports JSON values for complex config.
 */
export const settings = pgTable(
  "settings",
  {
    id,
    key: varchar("key", { length: 200 }).notNull().unique(),
    value: jsonb("value"),
    description: text("description"),
    group: varchar("group", { length: 100 }),
    createdAt,
    updatedAt,
  },
  (table) => [
    index("settings_key_idx").on(table.key),
    index("settings_group_idx").on(table.group),
  ]
);
