/* eslint-disable @typescript-eslint/no-explicit-any */
import type { IProvider } from "./provider.interface.js";
import type { ProviderDiagnostics } from "./provider.types.js";

export class ProviderManager {
  private readonly map = new Map<string, IProvider>();

  /**
   * Register a provider instance.
   */
  async register(provider: IProvider): Promise<void> {
    const { name } = provider;
    if (this.map.has(name)) {
      throw new Error(`Provider "${name}" already registered`);
    }
    this.map.set(name, provider);

    if (provider.register) {
      await provider.register();
    }
  }

  /**
   * Unregister a provider, shutting it down if necessary.
   */
  async unregister(name: string): Promise<void> {
    const provider = this.map.get(name);
    if (!provider) {
      throw new Error(`Provider "${name}" not found`);
    }

    if (provider.shutdown) {
      await provider.shutdown();
    }
    this.map.delete(name);
  }

  /**
   * Resolve a previously-registered provider.
   */
  get<T extends IProvider>(name: string): T {
    const provider = this.map.get(name);
    if (!provider) {
      throw new Error(`Provider "${name}" not found`);
    }
    return provider as T;
  }

  /**
   * Get all registered providers.
   */
  getAll(): IProvider[] {
    return Array.from(this.map.values());
  }

  /**
   * Check if a provider is registered.
   */
  has(name: string): boolean {
    return this.map.has(name);
  }

  /**
   * Enable a provider.
   */
  enable(name: string): void {
    const provider = this.get(name);
    provider.enabled = true;
  }

  /**
   * Disable a provider.
   */
  disable(name: string): void {
    const provider = this.get(name);
    provider.enabled = false;
  }

  /**
   * Boot all enabled providers.
   */
  async bootAll(): Promise<void> {
    for (const provider of this.map.values()) {
      if (provider.enabled && provider.boot) {
        await provider.boot();
      }
    }
  }

  /**
   * Shutdown all registered providers.
   */
  async shutdownAll(): Promise<void> {
    for (const provider of this.map.values()) {
      if (provider.shutdown) {
        await provider.shutdown();
      }
    }
  }

  /**
   * Get all registered provider names.
   */
  get names(): string[] {
    return Array.from(this.map.keys());
  }

  /**
   * Get diagnostic report of all registered providers.
   */
  async getDiagnostics(): Promise<ProviderDiagnostics[]> {
    const list: ProviderDiagnostics[] = [];

    for (const provider of this.map.values()) {
      let healthInfo: any = undefined;
      let diagInfo: any = undefined;

      if (provider.enabled) {
        if (provider.health) {
          try {
            healthInfo = await provider.health();
          } catch (err: any) {
            healthInfo = `Error: ${err.message}`;
          }
        }
        if (provider.diagnostics) {
          try {
            diagInfo = await provider.diagnostics();
          } catch (err: any) {
            diagInfo = { error: err.message };
          }
        }
      }

      list.push({
        name: provider.name,
        type: provider.type,
        version: provider.version,
        enabled: provider.enabled,
        health: healthInfo,
        diagnostics: diagInfo,
      });
    }

    return list;
  }
}
