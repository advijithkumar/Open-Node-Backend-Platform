import { relations } from "drizzle-orm";

import { users } from "./user.schema.js";
import { user as authUser } from "../auth/auth.schema.js";

export const usersRelations = relations(users, ({ one }) => ({
  auth: one(authUser, {
    fields: [users.authUserId],
    references: [authUser.id],
  }),
}));
