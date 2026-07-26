import { registerCore } from "@onbp/api/src/bootstrap/register-core.js";
import { registerPlugins } from "@onbp/api/src/bootstrap/register-plugins.js";
import { registerRoutes } from "@onbp/api/src/bootstrap/register-routes.js";
import { container } from "@onbp/api/src/core/container/container.js";
import { KERNEL_SERVICES } from "@onbp/api/src/core/kernel/kernel.constants.js";
import type { Kernel } from "@onbp/api/src/core/kernel/kernel.js";

export async function bootstrap(): Promise<void> {
  console.log("Bootstrapping {{pascalName}} Application...");

  // Phase 1: Register Core Services
  await registerCore();

  // Phase 2: Register Plugins
  await registerPlugins();

  // Phase 3: Register Routes
  await registerRoutes();

  // Phase 4: Transition state to READY
  const kernel = container.resolve<Kernel>(KERNEL_SERVICES.KERNEL);
  kernel.lifecycle.setState("READY");
  console.log("✓ {{pascalName}} Application is ready!");
}
