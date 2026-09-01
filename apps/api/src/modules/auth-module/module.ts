import type { Router } from "express";
import type { Kernel } from "../../core/kernel/index.js";
import type { IModule } from "../../core/modules/index.js";
import { AuthModuleRepository } from "./auth-module.repository.js";
import { AuthModuleService } from "./auth-module.service.js";
import { createAuthModuleRouter } from "./auth-module.router.js";

export class AuthModuleModule implements IModule {
  readonly name = "auth-module";
  readonly version = "1.0.0";
  readonly description = "AuthModule business capability module";

  routes?: Router;

  async register(kernel: Kernel): Promise<void> {
    kernel.logger.info("Registering AuthModule Module...");

    // Register Repository and Service in the Container
    kernel.container.registerSingleton("authModuleRepository", () => new AuthModuleRepository());
    kernel.container.registerSingleton(
      "authModuleService",
      (c) => new AuthModuleService(c.resolve("authModuleRepository"), kernel.events)
    );

    // Register module routes
    const service = kernel.container.resolve<AuthModuleService>("authModuleService");
    this.routes = createAuthModuleRouter(service);
  }

  async boot(kernel: Kernel): Promise<void> {
    kernel.logger.info("AuthModule Module booted");
  }

  async shutdown(kernel: Kernel): Promise<void> {
    kernel.logger.info("AuthModule Module shut down");
  }
}
