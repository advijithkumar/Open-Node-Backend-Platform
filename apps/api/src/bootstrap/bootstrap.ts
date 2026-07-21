import { registerCore } from "./register-core.js";
import { registerPlugins } from "./register-plugins.js";
import { registerModules } from "./register-modules.js";
import { registerRoutes } from "./register-routes.js";
import { LIFECYCLE, type LifecycleManager, } from "../core/lifecycle/index.js";
import { container } from "../core/container/index.js";
import { CORE_SERVICES } from "../core/container/service.constants.js";

export async function bootstrap(): Promise<void> {
  await registerCore();

  const lifecycle = container.resolve<LifecycleManager>(
    CORE_SERVICES.LIFECYCLE
  );

  lifecycle.setState(LIFECYCLE.BOOTSTRAPPING);

  await registerPlugins();
  lifecycle.setState(LIFECYCLE.PLUGINS_REGISTERED);

  await registerModules();
  lifecycle.setState(LIFECYCLE.MODULES_REGISTERED);

  await registerRoutes();
  lifecycle.setState(LIFECYCLE.ROUTES_REGISTERED);

  lifecycle.setState(LIFECYCLE.READY);
}