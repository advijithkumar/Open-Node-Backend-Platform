import { Redis } from "ioredis";
import { BaseProvider } from "../../core/plugin-sdk/index.js";
import { config } from "./config.js";

export class RedisProvider extends BaseProvider<Redis> {
  readonly name = "redis";
  readonly type = "cache";
  readonly version = "1.0.0";
  readonly plugin = "redis";

  override isConfigEnabled(): boolean {
    return config.enabled;
  }

  override async ping(client: Redis): Promise<void> {
    await client.ping();
  }

  override async createClient(): Promise<Redis> {
    let client: Redis;
    if (config.url) {
      client = new Redis(config.url, {
        maxRetriesPerRequest: 1,
      });
    } else {
      client = new Redis({
        host: config.host,
        port: config.port,
        password: config.password,
        db: config.db,
        maxRetriesPerRequest: 1,
      });
    }

    client.on("error", () => {
      this.enabled = false;
    });

    return client;
  }

  override async closeClient(client: Redis): Promise<void> {
    if (typeof client.quit === "function") {
      await client.quit();
    }
  }

  override getCustomDiagnostics(): Record<string, unknown> {
    return {
      host: config.host,
      port: config.port,
      db: config.db,
    };
  }
}
export default RedisProvider;
