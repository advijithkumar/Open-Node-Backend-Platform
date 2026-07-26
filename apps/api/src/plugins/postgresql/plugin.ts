import type { Container } from "../../core/container/index.js";
import { BasePlugin } from "../../core/plugin-sdk/index.js";
import { PostgresqlProvider } from "./provider.js";
import { POSTGRESQL_CONSTANTS } from "./constants.js";

export class PostgresqlPlugin extends BasePlugin {
  readonly name = "postgresql";
  readonly version = "1.0.0";
  readonly description = "Official PostgreSQL integration plugin";
  readonly providers = [new PostgresqlProvider()];

  override async register(container: Container): Promise<void> {
    // Register client instance dynamically from the provider once booted
    container.registerSingleton(POSTGRESQL_CONSTANTS.CLIENT_KEY, () => {
      return this.providers[0].getClient();
    });
  }
}
export default PostgresqlPlugin;
