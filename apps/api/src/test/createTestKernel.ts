// src/test/createTestKernel.ts
import { container } from "../core/container/index.js";
import { registerCore } from "../bootstrap/register-core.js";
import { registerModules } from "../bootstrap/register-modules.js";
import { registerRoutes } from "../bootstrap/register-routes.js";
import {type Kernel,KERNEL_SERVICES } from "../core/kernel/index.js";


/**
 * Builds a fully‑initialized Kernel (no HTTP server is started).
 * Ideal for unit & integration tests.
 */
export async function createTestKernel(): Promise<Kernel> {
  // Core services (app, container, logger, etc.)
  await registerCore();

  // Load modules and mount their routers (RouterManager does the mounting)
  await registerModules();
  await registerRoutes();

  // Resolve the kernel that the bootstrap stored in the container
  return container.resolve<Kernel>(KERNEL_SERVICES.KERNEL);
}
