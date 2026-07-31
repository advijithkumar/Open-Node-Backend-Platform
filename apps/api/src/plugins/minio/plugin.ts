import type { Container } from "../../core/container/index.js";
import { BasePlugin } from "../../core/plugin-sdk/index.js";
import { MinioProvider } from "./provider.js";
import { MINIO_CONSTANTS } from "./constants.js";

export class MinioPlugin extends BasePlugin {
  readonly name = "minio";
  readonly version = "1.0.0";
  readonly description = "Official MinIO storage integration plugin";
  readonly providers = [new MinioProvider()];

  override async register(container: Container): Promise<void> {
    // Register client instance dynamically from the provider once booted
    container.registerSingleton(MINIO_CONSTANTS.CLIENT_KEY, () => {
      return this.providers[0].getClient();
    });
  }
}
export default MinioPlugin;
