import { BaseProvider } from "../../core/plugin-sdk/index.js";
import { config } from "./config.js";

export class BetterAuthProvider extends BaseProvider<any> {
  readonly name = "better-auth";
  readonly type = "auth";
  readonly version = "1.0.0";
  readonly plugin = "better-auth";

  override isConfigEnabled(): boolean {
    return config.enabled;
  }

  override async ping(client: any): Promise<void> {
    if (!client || typeof client.handler !== "function") {
      throw new Error("Better Auth instance has no request handler function.");
    }
  }

  override async createClient(): Promise<any> {
    const { betterAuth } = await import("better-auth");
    return betterAuth({
      database: {
        db: {}, // stub/mock database object for dynamic plugin loading checks
        type: "postgres",
      },
      secret: config.secret,
      baseURL: config.baseUrl,
      trustedOrigins: config.trustedOrigins,
    });
  }

  override async closeClient(_client: any): Promise<void> {
    // Better Auth client is stateless HTTP-based, no connection shutdown needed
  }

  override getCustomDiagnostics(): Record<string, unknown> {
    return {
      baseUrl: config.baseUrl,
      trustedOrigins: config.trustedOrigins,
    };
  }
}
export default BetterAuthProvider;
