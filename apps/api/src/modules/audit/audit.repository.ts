import { eq, desc } from "drizzle-orm";
import { db } from "../../core/database/db.js";
import { auditLogs } from "../../core/database/schema/onbp/audit-log.schema.js";

export interface CreateAuditLogData {
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

export class AuditLogRepository {
  async create(data: CreateAuditLogData) {
    const result = await db
      .insert(auditLogs)
      .values(data as typeof auditLogs.$inferInsert)
      .returning();
    return result[0];
  }

  async findByUser(userId: string, limit = 50, offset = 0) {
    return db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.userId, userId))
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async findAll(limit = 100, offset = 0) {
    return db
      .select()
      .from(auditLogs)
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit)
      .offset(offset);
  }
}
