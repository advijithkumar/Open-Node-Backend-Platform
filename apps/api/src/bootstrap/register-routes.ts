import { logger } from "../core/logger/logger.js";
import { container } from "../core/container/index.js";
import { CORE_SERVICES } from "../core/container/service.constants.js";
import app from "../app.js";

export async function registerRoutes(): Promise<void> {
  logger.info("Registering Module Routes...");

  // Resolve RouterManager
  const routerMgr = container.resolve<any>(CORE_SERVICES.ROUTER);

  // Mount all registered routers (module routers are already registered in registerModules via ModuleLoader)
  routerMgr.mountAll(app);
  logger.info(`Mounted ${routerMgr.getDiagnostics().length} routers via RouterManager`);
}