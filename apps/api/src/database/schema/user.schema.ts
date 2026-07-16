import {
  pgTable,
  varchar,
  text,
} from "drizzle-orm/pg-core";

import {
  id,
  createdAt,
  updatedAt,
  deletedAt,
  isActive,
  version,
} from "./common.js";

export const users = pgTable("users", {
  id,

  firstName: varchar("first_name", { length: 100 }).notNull(),

  lastName: varchar("last_name", { length: 100 }).notNull(),

  username: varchar("username", { length: 50 }).notNull().unique(),

  email: varchar("email", { length: 255 }).notNull().unique(),

  passwordHash: text("password_hash").notNull(),

  isActive,

  version,

  createdAt,

  updatedAt,

  deletedAt,
});
