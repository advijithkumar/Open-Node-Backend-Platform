import type { Container } from "../container/index.js";
import type { IPlugin } from "./plugin.interface.js";

export interface PluginDiagnostics {
  name: string;
  version: string;
  dependencies: string[];
}

export class PluginManager {
  private readonly plugins = new Map<string, IPlugin>();

  register(plugin: IPlugin): void {
    if (this.plugins.has(plugin.name)) {
      throw new Error(`Plugin "${plugin.name}" already registered.`);
    }

    if (plugin.dependencies) {
      for (const dep of plugin.dependencies) {
        if (!this.plugins.has(dep)) {
          throw new Error(`Plugin "${plugin.name}" missing required dependency "${dep}"`);
        }
      }
    }

    this.plugins.set(plugin.name, plugin);
  }

  async registerServices(container: Container): Promise<void> {
    for (const plugin of this.plugins.values()) {
      await plugin.register?.(container);
    }
  }

  async boot(): Promise<void> {
    for (const plugin of this.plugins.values()) {
      await plugin.boot?.();
    }
  }

  async shutdown(): Promise<void> {
    const reversed = Array.from(this.plugins.values()).reverse();
    for (const plugin of reversed) {
      await plugin.shutdown?.();
    }
  }

  getPlugins(): IPlugin[] {
    return [...this.plugins.values()];
  }

  has(name: string): boolean {
    return this.plugins.has(name);
  }

  getDiagnostics(): PluginDiagnostics[] {
    return Array.from(this.plugins.values()).map((p) => ({
      name: p.name,
      version: p.version,
      dependencies: p.dependencies ?? [],
    }));
  }
}