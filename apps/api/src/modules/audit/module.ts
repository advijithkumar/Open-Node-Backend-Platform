import type { Router } from "express";
import type { Kernel } from "../../core/kernel/index.js";
import type { IModule } from "../../core/modules/index.js";
import { AuditLogRepository } from "./audit.repository.js";
import { AuditService } from "./audit.service.js";
import { createAuditRouter } from "./audit.router.js";

export class AuditModule implements IModule {
  readonly name = "audit";
  readonly version = "1.0.0";
  readonly description = "Audit logging module — immutable platform action history";
  readonly dependencies = [];

  routes?: Router;

  register(kernel: Kernel): void {
    kernel.logger.info("Registering Audit Module...");

    kernel.container.registerSingleton("auditRepository", () => new AuditLogRepository());
    kernel.container.registerSingleton(
      "auditService",
      (c) => new AuditService(c.resolve("auditRepository"))
    );

    const auditService = kernel.container.resolve<AuditService>("auditService");
    this.routes = createAuditRouter(auditService);
  }

  async boot(kernel: Kernel): Promise<void> {
    kernel.logger.info("Audit Module booted successfully");
  }

  async shutdown(kernel: Kernel): Promise<void> {
    kernel.logger.info("Audit Module shutdown successfully");
  }
}

export { AuditService } from "./audit.service.js";
export { AuditLogRepository } from "./audit.repository.js";
