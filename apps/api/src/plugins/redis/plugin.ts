import type { Container } from "../../core/container/index.js";
import { BasePlugin } from "../../core/plugin-sdk/index.js";
import { RedisProvider } from "./provider.js";
import { REDIS_CONSTANTS } from "./constants.js";

export class RedisPlugin extends BasePlugin {
  readonly name = "redis";
  readonly version = "1.0.0";
  readonly description = "Official Redis integration plugin";
  readonly providers = [new RedisProvider()];

  override async register(container: Container): Promise<void> {
    // Register client instance dynamically from the provider once booted
    container.registerSingleton(REDIS_CONSTANTS.CLIENT_KEY, () => {
      return this.providers[0].getClient();
    });
  }
}
export default RedisPlugin;
