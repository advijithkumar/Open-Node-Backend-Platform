import { container } from "../../core/container/container.js";
import { CORE_SERVICES } from "../../core/container/service.constants.js";
import type { IConfigManager } from "../../core/config/config.interface.js";

// Fetch config from the central ConfigManager registry
const getManager = (): IConfigManager => {
  return container.resolve<IConfigManager>(CORE_SERVICES.CONFIG);
};

export const config = {
  get url(): string | undefined {
    return getManager().get<string>("redis.url") || getManager().get<string>("plugins.redis.url");
  },
  get host(): string {
    return getManager().get<string>("redis.host") || getManager().get<string>("plugins.redis.host", "localhost");
  },
  get port(): number {
    return getManager().get<number>("redis.port") || getManager().get<number>("plugins.redis.port", 6379);
  },
  get password(): string | undefined {
    return getManager().get<string>("redis.password") || getManager().get<string>("plugins.redis.password");
  },
  get db(): number {
    return getManager().get<number>("redis.db") || getManager().get<number>("plugins.redis.db", 0);
  },
  get enabled(): boolean {
    return getManager().get<boolean>("plugins.redis.enabled", true);
  }
};
