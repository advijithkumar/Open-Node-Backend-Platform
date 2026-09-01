import type { Router } from "express";
import type { Kernel } from "../../core/kernel/index.js";
import type { IModule } from "../../core/modules/index.js";
import { UsersModuleRepository } from "./users-module.repository.js";
import { UsersModuleService } from "./users-module.service.js";
import { createUsersModuleRouter } from "./users-module.router.js";

export class UsersModuleModule implements IModule {
  readonly name = "users-module";
  readonly version = "1.0.0";
  readonly description = "UsersModule business capability module";

  routes?: Router;

  async register(kernel: Kernel): Promise<void> {
    kernel.logger.info("Registering UsersModule Module...");

    // Register Repository and Service in the Container
    kernel.container.registerSingleton("usersModuleRepository", () => new UsersModuleRepository());
    kernel.container.registerSingleton(
      "usersModuleService",
      (c) => new UsersModuleService(c.resolve("usersModuleRepository"), kernel.events)
    );

    // Register module routes
    const service = kernel.container.resolve<UsersModuleService>("usersModuleService");
    this.routes = createUsersModuleRouter(service);
  }

  async boot(kernel: Kernel): Promise<void> {
    kernel.logger.info("UsersModule Module booted");
  }

  async shutdown(kernel: Kernel): Promise<void> {
    kernel.logger.info("UsersModule Module shut down");
  }
}
