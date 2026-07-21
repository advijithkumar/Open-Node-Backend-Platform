import { pgTable, text, primaryKey, index } from "drizzle-orm/pg-core";
import { createdAt } from "../common.js";
import { roles } from "./role.schema.js";
import { permissions } from "./permission.schema.js";
import { users } from "./user.schema.js";

/**
 * role_permissions — junction table linking roles to permissions.
 */
export const rolePermissions = pgTable(
  "role_permissions",
  {
    roleId: text("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    permissionId: text("permission_id")
      .notNull()
      .references(() => permissions.id, { onDelete: "cascade" }),
    createdAt,
  },
  (table) => [
    primaryKey({ columns: [table.roleId, table.permissionId] }),
    index("role_permissions_role_idx").on(table.roleId),
  ]
);

/**
 * user_roles — junction table linking users to roles.
 */
export const userRoles = pgTable(
  "user_roles",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    roleId: text("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    createdAt,
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.roleId] }),
    index("user_roles_user_idx").on(table.userId),
  ]
);
