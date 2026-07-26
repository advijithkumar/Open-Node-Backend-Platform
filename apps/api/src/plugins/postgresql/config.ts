import { container } from "../../core/container/container.js";
import { CORE_SERVICES } from "../../core/container/service.constants.js";
import type { IConfigManager } from "../../core/config/config.interface.js";

// Fetch config from the central ConfigManager registry
const getManager = (): IConfigManager => {
  return container.resolve<IConfigManager>(CORE_SERVICES.CONFIG);
};

export const config = {
  get url(): string | undefined {
    return getManager().get<string>("database.url") || getManager().get<string>("plugins.postgresql.url");
  },
  get host(): string {
    return getManager().get<string>("database.host") || getManager().get<string>("plugins.postgresql.host", "localhost");
  },
  get port(): number {
    return getManager().get<number>("database.port") || getManager().get<number>("plugins.postgresql.port", 5432);
  },
  get username(): string {
    return getManager().get<string>("database.username") || getManager().get<string>("plugins.postgresql.username", "postgres");
  },
  get password(): string {
    return getManager().get<string>("database.password") || getManager().get<string>("plugins.postgresql.password", "");
  },
  get database(): string {
    return getManager().get<string>("database.database") || getManager().get<string>("plugins.postgresql.database", "postgres");
  },
  get max(): number {
    return getManager().get<number>("database.max") || getManager().get<number>("plugins.postgresql.max", 10);
  },
  get idleTimeout(): number {
    return getManager().get<number>("database.idle_timeout") || getManager().get<number>("plugins.postgresql.idleTimeout", 30);
  },
  get enabled(): boolean {
    return getManager().get<boolean>("plugins.postgresql.enabled", true);
  }
};
