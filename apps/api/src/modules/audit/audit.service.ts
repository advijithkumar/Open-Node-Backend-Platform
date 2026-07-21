import type { AuditLogRepository, CreateAuditLogData } from "./audit.repository.js";

export class AuditService {
  constructor(private readonly auditRepository: AuditLogRepository) {}

  /**
   * Log a platform action. Call this from services to record important events.
   */
  async log(data: CreateAuditLogData) {
    return this.auditRepository.create(data);
  }

  async getLogsByUser(userId: string, limit = 50, offset = 0) {
    return this.auditRepository.findByUser(userId, limit, offset);
  }

  async getAllLogs(limit = 100, offset = 0) {
    return this.auditRepository.findAll(limit, offset);
  }
}
