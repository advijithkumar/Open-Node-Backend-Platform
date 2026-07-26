import { logger } from "../core/logger/logger.js";
import { container } from "../core/container/index.js";
import { CORE_SERVICES } from "../core/container/service.constants.js";

import app from "../app.js";
import { SettingRepository } from "../modules/organizations/settings.repository.js";
import { SettingService } from "../modules/organizations/settings.service.js";
import { createSettingsRouter } from "../modules/organizations/settings.router.js";

export async function registerRoutes(): Promise<void> {
  logger.info("Registering Module Routes...");

  // Register platform settings routes via RouterManager
  const routerMgr = container.resolve<any>(CORE_SERVICES.ROUTER);

  const settingRepo = new SettingRepository();
  const settingService = new SettingService(settingRepo);
  routerMgr.register({ prefix: "/api/v1/settings", router: createSettingsRouter(settingService) });

  // Mount all registered routers (module routers are already registered in registerModules)
  routerMgr.mountAll(app);
  logger.info(`Mounted ${routerMgr.getDiagnostics().length} routers via RouterManager`);
}