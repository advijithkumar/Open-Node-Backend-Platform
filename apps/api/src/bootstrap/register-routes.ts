import { logger } from "../core/logger/logger.js";
import { container } from "../core/container/index.js";
import { CORE_SERVICES } from "../core/container/service.constants.js";
import type { ModuleManager } from "../core/modules/module.manager.js";
import app from "../app.js";
import { SettingRepository } from "../modules/organizations/settings.repository.js";
import { SettingService } from "../modules/organizations/settings.service.js";
import { createSettingsRouter } from "../modules/organizations/settings.router.js";

export async function registerRoutes(): Promise<void> {
  logger.info("Registering Module Routes...");

  if (container.has(CORE_SERVICES.MODULES)) {
    const moduleManager = container.resolve<ModuleManager>(CORE_SERVICES.MODULES);
    const modules = moduleManager.getAll();

    for (const mod of modules) {
      if (mod.routes) {
        const routePath = `/api/v1/${mod.name}`;
        app.use(routePath, mod.routes);
        logger.info(`Mounted routes for module [${mod.name}] at ${routePath}`);
      }
    }
  }

  // Register platform settings routes
  const settingRepo = new SettingRepository();
  const settingService = new SettingService(settingRepo);
  app.use("/api/v1/settings", createSettingsRouter(settingService));
  logger.info("Mounted routes for [settings] at /api/v1/settings");
}