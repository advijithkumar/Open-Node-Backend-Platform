import { container } from "../../core/container/container.js";
import { CORE_SERVICES } from "../../core/container/service.constants.js";
import type { IConfigManager } from "../../core/config/config.interface.js";

// Fetch config from the central ConfigManager registry
const getManager = (): IConfigManager => {
  return container.resolve<IConfigManager>(CORE_SERVICES.CONFIG);
};

export const config = {
  get secret(): string {
    return getManager().get<string>("auth.secret") || getManager().get<string>("plugins.better-auth.secret", "default-auth-secret-key-12345");
  },
  get baseUrl(): string {
    return getManager().get<string>("auth.baseUrl") || getManager().get<string>("plugins.better-auth.baseUrl", "http://localhost:8080");
  },
  get trustedOrigins(): string[] {
    return getManager().get<string[]>("auth.trustedOrigins") || getManager().get<string[]>("plugins.better-auth.trustedOrigins", []);
  },
  get session(): Record<string, unknown> {
    return getManager().get<Record<string, unknown>>("auth.session") || getManager().get<Record<string, unknown>>("plugins.better-auth.session", {});
  },
  get cookie(): Record<string, unknown> {
    return getManager().get<Record<string, unknown>>("auth.cookie") || getManager().get<Record<string, unknown>>("plugins.better-auth.cookie", {});
  },
  get enabled(): boolean {
    return getManager().get<boolean>("plugins.better-auth.enabled", true);
  }
};
