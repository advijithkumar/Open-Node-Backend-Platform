import { Client } from "minio";
import { BaseProvider } from "../../core/plugin-sdk/index.js";
import { config } from "./config.js";

export class MinioProvider extends BaseProvider<Client> {
  readonly name = "minio";
  readonly type = "storage";
  readonly version = "1.0.0";
  readonly plugin = "minio";

  override isConfigEnabled(): boolean {
    return config.enabled;
  }

  override async ping(client: Client): Promise<void> {
    await client.listBuckets();
  }

  override async createClient(): Promise<Client> {
    return new Client({
      endPoint: config.endpoint,
      port: config.port,
      useSSL: config.useSSL,
      accessKey: config.accessKey,
      secretKey: config.secretKey,
    });
  }

  override async closeClient(_client: Client): Promise<void> {
    // Minio client uses HTTP request agent, no connection shutdown needed
  }

  override getCustomDiagnostics(): Record<string, unknown> {
    return {
      endpoint: config.endpoint,
      port: config.port,
      bucket: config.bucket,
      useSSL: config.useSSL,
    };
  }
}
export default MinioProvider;
