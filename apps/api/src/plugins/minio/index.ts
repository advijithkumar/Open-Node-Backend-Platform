import type { IPlugin } from "../../core/plugins/plugin.interface.js";
import type { Container } from "../../core/container/index.js";
import { logger } from "../../core/logger/logger.js";

export class StorageService {
  async uploadFile(bucket: string, filename: string, content: Buffer): Promise<string> {
    logger.info({ bucket, filename, size: content.length }, "Mock Storage upload completed");
    return `storage://${bucket}/${filename}`;
  }
}

export class MinioPlugin implements IPlugin {
  readonly name = "minio";
  readonly version = "1.0.0";
  readonly description = "MinIO / Object Storage Plugin";

  register(container: Container): void {
    logger.info("Registering MinIO Storage Plugin...");
    container.registerSingleton("storageService", () => new StorageService());
  }

  async boot(): Promise<void> {
    logger.info("MinIO Plugin booted successfully");
  }

  async shutdown(): Promise<void> {
    logger.info("MinIO Plugin shutdown successfully");
  }
}
