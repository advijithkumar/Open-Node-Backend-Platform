/* eslint-disable @typescript-eslint/no-explicit-any */
import { container } from "../core/container/index.js";
import { CORE_SERVICES } from "../core/container/service.constants.js";
import { KERNEL_SERVICES, type Kernel } from "../core/kernel/index.js";
import { logger } from "../core/logger/logger.js";
import { ModuleLoader } from "../core/modules/module.loader.js";

export async function registerModules(): Promise<void> {
  logger.info("Registering Modules...");

  const kernel = container.resolve<Kernel>(KERNEL_SERVICES.KERNEL);

  // Phase 1: Register all modules automatically using ModuleLoader
  await ModuleLoader.loadAll(container);

  // Phase 2: Load (Register & Boot) all modules using the proper two-phase boot strategy
  await kernel.modules.loadAll(kernel);

  // Register each module's router (if any) with the central RouterManager
  const routerMgr = container.resolve<any>(CORE_SERVICES.ROUTER);
  for (const mod of kernel.modules.getAll()) {
    if (mod.routes) {
      const prefix = `/api/v1/${mod.name}`;
      routerMgr.register({ prefix, router: mod.routes });
      kernel.logger.info(`Mounted router for module ${mod.name} at ${prefix}`);
    }
  }
}
