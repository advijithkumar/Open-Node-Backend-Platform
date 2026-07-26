import type { IProvider } from "../provider/provider.interface.js";
import { PluginConnectionError } from "./plugin.errors.js";

export abstract class BaseProvider<TClient> implements IProvider {
  abstract readonly name: string;
  abstract readonly type: string;
  abstract readonly version: string;
  enabled = true;
  abstract readonly plugin: string;

  protected client?: TClient;

  getClient(): TClient {
    if (!this.client) {
      throw new Error(`[Provider: ${this.name}] Not booted.`);
    }
    return this.client;
  }

  setClient(client: TClient): void {
    this.client = client;
    this.enabled = true;
  }

  /**
   * Ping the client to verify connection health.
   */
  abstract ping(client: TClient): Promise<void>;

  /**
   * Create the client instance using driver configurations.
   */
  abstract createClient(): Promise<TClient> | TClient;

  /**
   * Close the client instance gracefully.
   */
  abstract closeClient(client: TClient): Promise<void> | void;

  /**
   * Optional config-enabled check hook. Overrides if the provider
   * should read its enable status dynamically.
   */
  isConfigEnabled(): boolean {
    return true;
  }

  /**
   * Expose custom configuration parameters for diagnostics.
   */
  getCustomDiagnostics(): Record<string, unknown> {
    return {};
  }

  async register(): Promise<void> {
    // Optional hook
  }

  async boot(): Promise<void> {
    if (!this.isConfigEnabled()) {
      this.enabled = false;
      return;
    }
    this.enabled = true;

    // If client is already set (e.g. injected in tests), verify and return
    if (this.client) {
      try {
        await this.ping(this.client);
        return;
      } catch (err: unknown) {
        this.enabled = false;
        const message = err instanceof Error ? err.message : String(err);
        throw new PluginConnectionError(
          this.name,
          `Failed to verify injected database connection: ${message}`,
          { cause: err }
        );
      }
    }

    try {
      this.client = await this.createClient();
      await this.ping(this.client);
    } catch (err: unknown) {
      this.enabled = false;
      const message = err instanceof Error ? err.message : String(err);
      throw new PluginConnectionError(
        this.name,
        `Failed to establish database connection: ${message}`,
        { cause: err }
      );
    }
  }

  async shutdown(): Promise<void> {
    if (this.client) {
      try {
        await this.closeClient(this.client);
      } finally {
        this.client = undefined;
      }
    }
  }

  async health(): Promise<Record<string, any>> {
    if (!this.enabled || !this.client) {
      return { status: "unhealthy", reason: "Provider not enabled or connected" };
    }
    try {
      await this.ping(this.client);
      return { status: "healthy" };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return { status: "unhealthy", reason: message };
    }
  }

  async diagnostics(): Promise<Record<string, any>> {
    return {
      name: this.name,
      type: this.type,
      version: this.version,
      enabled: this.enabled,
      hasClient: !!this.client,
      config: this.getCustomDiagnostics(),
    };
  }
}
export default BaseProvider;
