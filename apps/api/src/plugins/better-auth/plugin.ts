import type { Container } from "../../core/container/index.js";
import { BasePlugin } from "../../core/plugin-sdk/index.js";
import { BetterAuthProvider } from "./provider.js";
import { BETTER_AUTH_CONSTANTS } from "./constants.js";

export class BetterAuthPlugin extends BasePlugin {
  readonly name = "better-auth";
  readonly version = "1.0.0";
  readonly description = "Official Better Auth integration plugin";
  readonly providers = [new BetterAuthProvider()];

  override async register(container: Container): Promise<void> {
    // Register client instance dynamically from the provider once booted
    container.registerSingleton(BETTER_AUTH_CONSTANTS.CLIENT_KEY, () => {
      return this.providers[0].getClient();
    });
  }
}
export default BetterAuthPlugin;
