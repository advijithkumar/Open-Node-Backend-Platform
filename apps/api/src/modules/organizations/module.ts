import type { Router } from "express";
import type { Kernel } from "../../core/kernel/index.js";
import type { IModule } from "../../core/modules/index.js";
import { OrganizationsRepository } from "./organizations.repository.js";
import { OrganizationsService } from "./organizations.service.js";
import { createOrganizationsRouter } from "./organizations.router.js";

export class OrganizationsModule implements IModule {
  readonly name = "organizations";
  readonly version = "1.0.0";
  readonly description = "Organizations business capability module";

  routes?: Router;

  async register(kernel: Kernel): Promise<void> {
    kernel.logger.info("Registering Organizations Module...");

    // Register Repository and Service in the Container
    kernel.container.registerSingleton("organizationsRepository", () => new OrganizationsRepository());
    kernel.container.registerSingleton(
      "organizationsService",
      (c) => new OrganizationsService(c.resolve("organizationsRepository"), kernel.events)
    );

    // Register module routes
    const service = kernel.container.resolve<OrganizationsService>("organizationsService");
    this.routes = createOrganizationsRouter(service);
  }

  async boot(kernel: Kernel): Promise<void> {
    kernel.logger.info("Organizations Module booted");
  }

  async shutdown(kernel: Kernel): Promise<void> {
    kernel.logger.info("Organizations Module shut down");
  }
}
