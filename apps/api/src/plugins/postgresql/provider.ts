import postgres from "postgres";
import { BaseProvider } from "../../core/plugin-sdk/index.js";
import { config } from "./config.js";

export class PostgresqlProvider extends BaseProvider<postgres.Sql> {
  readonly name = "postgresql";
  readonly type = "database";
  readonly version = "1.0.0";
  readonly plugin = "postgresql";

  override isConfigEnabled(): boolean {
    return config.enabled;
  }

  override async ping(client: postgres.Sql): Promise<void> {
    await client`SELECT 1`;
  }

  override async createClient(): Promise<postgres.Sql> {
    if (config.url) {
      return postgres(config.url, {
        max: config.max,
        idle_timeout: config.idleTimeout,
      });
    }

    return postgres({
      host: config.host,
      port: config.port,
      username: config.username,
      password: config.password,
      database: config.database,
      max: config.max,
      idle_timeout: config.idleTimeout,
    });
  }

  override async closeClient(client: postgres.Sql): Promise<void> {
    if (typeof client.end === "function") {
      await client.end({ timeout: 5 });
    }
  }

  override getCustomDiagnostics(): Record<string, unknown> {
    return {
      max: config.max,
      idleTimeout: config.idleTimeout,
    };
  }
}
export default PostgresqlProvider;
