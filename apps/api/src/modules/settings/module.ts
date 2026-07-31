import type { Router } from "express";
import type { Kernel } from "../../core/kernel/index.js";
import type { IModule } from "../../core/modules/index.js";
import { SettingsRepository } from "./settings.repository.js";
import { SettingsService } from "./settings.service.js";
import { createSettingsRouter } from "./settings.router.js";

export class SettingsModule implements IModule {
  readonly name = "settings";
  readonly version = "1.0.0";
  readonly description = "Settings business capability module";

  routes?: Router;

  async register(kernel: Kernel): Promise<void> {
    kernel.logger.info("Registering Settings Module...");

    // Register Repository and Service in the Container
    kernel.container.registerSingleton("settingsRepository", () => new SettingsRepository());
    kernel.container.registerSingleton(
      "settingsService",
      (c) => new SettingsService(c.resolve("settingsRepository"), kernel.events)
    );

    // Register module routes
    const service = kernel.container.resolve<SettingsService>("settingsService");
    this.routes = createSettingsRouter(service);
  }

  async boot(kernel: Kernel): Promise<void> {
    kernel.logger.info("Settings Module booted");
  }

  async shutdown(kernel: Kernel): Promise<void> {
    kernel.logger.info("Settings Module shut down");
  }
}
