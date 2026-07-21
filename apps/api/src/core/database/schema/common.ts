import {
  boolean,
  integer,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

/**
 * Common reusable database columns for ONBP.
 */

export const id = uuid("id").primaryKey();

export const createdAt = timestamp("created_at", {
  withTimezone: true,
})
  .defaultNow()
  .notNull();

export const updatedAt = timestamp("updated_at", {
  withTimezone: true,
})
  .defaultNow()
  .notNull();

export const deletedAt = timestamp("deleted_at", {
  withTimezone: true,
});

export const isActive = boolean("is_active")
  .default(true)
  .notNull();

export const version = integer("version")
  .default(1)
  .notNull();
