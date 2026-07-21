import {
  pgTable,
  varchar,
  text
} from "drizzle-orm/pg-core";
import { user as authUser } from "../auth/auth.schema.js";
import {
  id,
  createdAt,
  updatedAt,
  deletedAt,
  isActive,
  version,
} from "../common.js";

export const users = pgTable("users", {
  id,
  authUserId: text("auth_user_id")
    .notNull()
    .unique()
    .references(() => authUser.id, {
      onDelete: "cascade",
    }),
  firstName: varchar("first_name", { length: 100 }).notNull(),

  lastName: varchar("last_name", { length: 100 }).notNull(),

  username: varchar("username", { length: 50 }).notNull().unique(),

  email: varchar("email", { length: 255 }).notNull().unique(),

  isActive,

  version,

  createdAt,

  updatedAt,

  deletedAt,
});
