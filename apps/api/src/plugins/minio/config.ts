import { container } from "../../core/container/container.js";
import { CORE_SERVICES } from "../../core/container/service.constants.js";
import type { IConfigManager } from "../../core/config/config.interface.js";

// Fetch config from the central ConfigManager registry
const getManager = (): IConfigManager => {
  return container.resolve<IConfigManager>(CORE_SERVICES.CONFIG);
};

export const config = {
  get endpoint(): string {
    return getManager().get<string>("minio.endpoint", "localhost");
  },
  get port(): number {
    return getManager().get<number>("minio.port", 9000);
  },
  get useSSL(): boolean {
    return getManager().get<boolean>("minio.useSSL", false);
  },
  get accessKey(): string {
    return getManager().get<string>("minio.accessKey", "");
  },
  get secretKey(): string {
    return getManager().get<string>("minio.secretKey", "");
  },
  get bucket(): string {
    return getManager().get<string>("minio.bucket", "onbp-bucket");
  },
  get enabled(): boolean {
    return getManager().get<boolean>("plugins.minio.enabled", true);
  }
};
