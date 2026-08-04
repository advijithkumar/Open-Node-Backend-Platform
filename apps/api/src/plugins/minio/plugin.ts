import type { Container } from "../../core/container/index.js";
import { BasePlugin } from "../../core/plugin-sdk/index.js";
import { MinioProvider } from "./provider.js";
import { MINIO_CONSTANTS } from "./constants.js";
import { CORE_SERVICES } from "../../core/container/service.constants.js";
import { container } from "../../core/container/container.js";

export class MinioPlugin extends BasePlugin {
  readonly name = "minio";
  readonly version = "1.0.0";
  readonly description = "Official MinIO storage integration plugin";
  readonly providers = [new MinioProvider()];

  override async register(containerInstance: Container): Promise<void> {
    // Register client instance dynamically from the provider once booted
    containerInstance.registerSingleton(MINIO_CONSTANTS.CLIENT_KEY, () => {
      return this.providers[0].getClient();
    });
  }

  override async boot(): Promise<void> {
    try {
      if (container.has(CORE_SERVICES.STORAGE)) {
        const storageService = container.resolve<any>(CORE_SERVICES.STORAGE);
        storageService.setProvider("minio", this.providers[0]);
      }
    } catch {
      // Fallback if Storage Service isn't registered
    }
  }
}
export default MinioPlugin;
