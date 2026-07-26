import type { Container } from "../container/index.js";
import { container } from "../container/container.js";
import { CORE_SERVICES } from "../container/service.constants.js";
import type { IPlugin } from "./plugin.interface.js";

export interface PluginDiagnostics {
  name: string;
  version: string;
  enabled: boolean;
  providerCount: number;
  dependencies: string[];
}

export class PluginManager {
  private readonly plugins = new Map<string, IPlugin>();

  async register(plugin: IPlugin): Promise<void> {
    if (this.plugins.has(plugin.name)) {
      throw new Error(`Plugin "${plugin.name}" already registered.`);
    }

    this.plugins.set(plugin.name, plugin);

    // If the plugin exposes providers, register them with the ProviderManager
    if (plugin.providers) {
      const providerMgr = container.resolve<any>(CORE_SERVICES.PROVIDER_MANAGER);
      for (const provider of plugin.providers) {
        // Associate the provider with this plugin
        provider.plugin = plugin.name;
        await providerMgr.register(provider);
      }
    }
  }

  async registerServices(containerInstance: Container): Promise<void> {
    const sorted = this.getTopologicallySortedPlugins();
    for (const plugin of sorted) {
      await plugin.register?.(containerInstance);
    }
  }

  async boot(): Promise<void> {
    const sorted = this.getTopologicallySortedPlugins();
    for (const plugin of sorted) {
      await plugin.boot?.();
    }
  }

  async shutdown(): Promise<void> {
    const sortedReversed = this.getTopologicallySortedPlugins().reverse();
    for (const plugin of sortedReversed) {
      await plugin.shutdown?.();
    }
  }

  getPlugins(): IPlugin[] {
    return this.getTopologicallySortedPlugins();
  }

  has(name: string): boolean {
    return this.plugins.has(name);
  }

  getTopologicallySortedPlugins(): IPlugin[] {
    const visited = new Set<string>();
    const temp = new Set<string>();
    const order: IPlugin[] = [];

    const visit = (name: string) => {
      if (temp.has(name)) {
        throw new Error(`Circular plugin dependency detected involving "${name}"`);
      }
      if (!visited.has(name)) {
        temp.add(name);
        const plugin = this.plugins.get(name);
        if (plugin && plugin.dependencies) {
          for (const dep of plugin.dependencies) {
            if (!this.plugins.has(dep)) {
              throw new Error(`Missing plugin dependency: "${dep}" required by "${name}"`);
            }
            visit(dep);
          }
        }
        temp.delete(name);
        visited.add(name);
        if (plugin) {
          order.push(plugin);
        }
      }
    };

    for (const name of this.plugins.keys()) {
      if (!visited.has(name)) {
        visit(name);
      }
    }

    return order;
  }

  getDiagnostics(): PluginDiagnostics[] {
    return this.getTopologicallySortedPlugins().map((p) => ({
      name: p.name,
      version: p.version,
      enabled: true,
      providerCount: p.providers?.length ?? 0,
      dependencies: p.dependencies ?? [],
    }));
  }
}