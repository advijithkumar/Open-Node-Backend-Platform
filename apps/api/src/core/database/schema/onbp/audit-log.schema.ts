import { pgTable, text, varchar, jsonb, index } from "drizzle-orm/pg-core";
import { id, createdAt } from "../common.js";

/**
 * audit_logs table — captures every significant action in the system.
 * Immutable: never updated or deleted (no deletedAt / updatedAt).
 */
export const auditLogs = pgTable(
  "audit_logs",
  {
    id,
    userId: text("user_id"),
    action: varchar("action", { length: 200 }).notNull(),
    resource: varchar("resource", { length: 100 }).notNull(),
    resourceId: text("resource_id"),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    metadata: jsonb("metadata"),
    createdAt,
  },
  (table) => [
    index("audit_logs_user_idx").on(table.userId),
    index("audit_logs_resource_idx").on(table.resource),
    index("audit_logs_created_at_idx").on(table.createdAt),
  ]
);
