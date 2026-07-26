import { container } from "../../core/container/container.js";
import { CORE_SERVICES } from "../../core/container/service.constants.js";
import type { IConfigManager } from "../../core/config/config.interface.js";

// Fetch config from the central ConfigManager registry
const getManager = (): IConfigManager => {
  return container.resolve<IConfigManager>(CORE_SERVICES.CONFIG);
};

export const config = {
  get endpoint(): string {
    return getManager().get<string>("plugins.{{camelName}}.endpoint", "http://localhost");
  },
  get enabled(): boolean {
    return getManager().get<boolean>("plugins.{{camelName}}.enabled", true);
  }
};
