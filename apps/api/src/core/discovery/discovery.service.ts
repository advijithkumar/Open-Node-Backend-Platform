/**
 * Discovery Service – singleton used by the Kernel.
 * Currently a stub – discovery logic will be added later.
 */

import { container } from "../container/index.js";
import { CORE_SERVICES } from "../container/service.constants.js";
import { PLUGIN_SERVICES } from "../plugins/plugin.constants.js";
import { MODULE_SERVICES } from "../modules/module.constants.js";
import type { IDiscoveryService, ModuleMetadata, FailedModuleMetadata, PluginMetadata, FailedPluginMetadata, ProviderMetadata, ServiceMetadata, RouteMetadata } from "./discovery.interface.js";
import type { IModule } from "../modules/module.interface.js";
import { PluginLoader } from "../plugins/plugin.loader.js";
import { ModuleLoader } from "../modules/module.loader.js";

/**
 * Central discovery service – a singleton registered in the kernel.
 * For now it only provides a thin wrapper around `ModuleManager.getAll()`
 * and maps the modules to the generic `ModuleMetadata` shape.
 */
export class DiscoveryService implements IDiscoveryService {
  constructor() {
    // No‑op – the service starts empty.
  }

  /** Return metadata for all registered modules */
  discoverModules(): ModuleMetadata[] {
    // Resolve the ModuleManager from the global container.
        const moduleManager = container.resolve<any>(MODULE_SERVICES.REGISTRY);
    if (!moduleManager || typeof moduleManager.getAll !== "function") {
      return [];
    }
    const modules: IModule[] = moduleManager.getAll();
    const disabledModules = moduleManager.disabledModules ?? new Set<string>();
    return modules
      .filter((m) => !disabledModules.has(m.name))
      .map((mod) => ({
        name: mod.name,
        version: mod.version,
        description: mod.description,
        enabled: true,
        source: undefined,
      }));
  }

  /** Return failed module metadata */
  discoverFailedModules(): FailedModuleMetadata[] {
    return ModuleLoader.failedModules;
  }

  /** Return disabled module metadata */
  discoverDisabledModules(): ModuleMetadata[] {
    const moduleManager = container.resolve<any>(MODULE_SERVICES.REGISTRY);
    if (!moduleManager || typeof moduleManager.getAll !== "function") {
      return [];
    }
    const modules: IModule[] = moduleManager.getAll();
    const disabledModules = moduleManager.disabledModules ?? new Set<string>();
    return modules
      .filter((m) => disabledModules.has(m.name))
      .map((mod) => ({
        name: mod.name,
        version: mod.version,
        description: mod.description,
        enabled: false,
        source: undefined,
      }));
  }

  /** Return module dependency graph */
  getModuleDependencyGraph(): Record<string, string[]> {
    const moduleManager = container.resolve<any>(MODULE_SERVICES.REGISTRY);
    if (!moduleManager || typeof moduleManager.getAll !== "function") {
      return {};
    }
    const graph: Record<string, string[]> = {};
    for (const m of moduleManager.getAll()) {
      graph[m.name] = m.dependencies ?? [];
    }
    return graph;
  }

  /** Return module boot order */
  getModuleBootOrder(): string[] {
    const moduleManager = container.resolve<any>(MODULE_SERVICES.REGISTRY);
    if (!moduleManager || typeof moduleManager.getTopologicallySortedModules !== "function") {
      return [];
    }
    try {
      return moduleManager.getTopologicallySortedModules().map((m: any) => m.name);
    } catch {
      return [];
    }
  }

  /** Return metadata for all registered plugins */
  discoverPlugins(): PluginMetadata[] {
    const pluginManager = container.resolve<any>(PLUGIN_SERVICES.REGISTRY);
    if (!pluginManager || typeof pluginManager.getPlugins !== "function") {
      return [];
    }
    const plugins = pluginManager.getPlugins();
    return plugins
      .filter((p: any) => p.enabled !== false)
      .map((p: any) => ({
        name: p.name,
        version: p.version,
        description: p.description,
        enabled: true,
        providerCount: p.providers?.length ?? 0,
        source: undefined,
      }));
  }

  /** Return failed plugin metadata */
  discoverFailedPlugins(): FailedPluginMetadata[] {
    return PluginLoader.failedPlugins;
  }

  /** Return disabled plugin metadata */
  discoverDisabledPlugins(): PluginMetadata[] {
    const pluginManager = container.resolve<any>(PLUGIN_SERVICES.REGISTRY);
    if (!pluginManager || typeof pluginManager.getPlugins !== "function") {
      return [];
    }
    const plugins = pluginManager.getPlugins();
    return plugins
      .filter((p: any) => p.enabled === false)
      .map((p: any) => ({
        name: p.name,
        version: p.version,
        description: p.description,
        enabled: false,
        providerCount: p.providers?.length ?? 0,
        source: undefined,
      }));
  }

  /** Return metadata for all registered providers */
  async discoverProviders(): Promise<ProviderMetadata[]> {
    const providerMgr = container.resolve<any>(CORE_SERVICES.PROVIDER_MANAGER);
    if (!providerMgr || typeof providerMgr.getDiagnostics !== "function") {
      return [];
    }
    const diags = await providerMgr.getDiagnostics();
    return diags.map((d: any) => {
      let parentPlugin: string | undefined = undefined;
      try {
        const prov = providerMgr.get(d.name);
        parentPlugin = prov.plugin;
      } catch {
        // Ignore
      }

      return {
        name: d.name,
        type: d.type,
        version: d.version,
        enabled: d.enabled,
        plugin: parentPlugin,
        health: d.health,
      };
    });
  }

  /** Return metadata for all services registered in the DI container */
  discoverServices(): ServiceMetadata[] {
    const anyContainer: any = container as any;
    const definitions: Map<string, any> = anyContainer.definitions ?? new Map();
    const singletons: Map<string, unknown> = anyContainer.singletons ?? new Map();
    const services: ServiceMetadata[] = [];
    for (const [key, def] of definitions.entries()) {
      services.push({
        name: key,
        version: "",
        description: undefined,
        enabled: true,
        source: undefined,
        key,
        scope: def.scope as any,
        resolved: singletons.has(key) || !!def.instance,
      });
    }
    return services;
  }

  /** Return metadata for all registered routes */
  discoverRoutes(): RouteMetadata[] {
    const routerMgr = container.resolve<any>(CORE_SERVICES.ROUTER);
    const anyRouterMgr: any = routerMgr as any;
    const registry: Map<string, any> = anyRouterMgr.registry ?? new Map();
    const routes: RouteMetadata[] = [];
    for (const [prefix, reg] of registry.entries()) {
      const router = reg.router as any;
      const stack = router.stack ?? [];
      const middlewareCount = stack.filter((layer: any) => !layer.route).length;
      for (const layer of stack) {
        if (!layer.route) continue;
        const routePath = layer.route?.path || "";
        const methods = Object.keys(layer.route.methods || {});
        const method = methods.find((m) => layer.route.methods[m]);
        routes.push({
          name: `${prefix}${routePath}`,
          version: "",
          description: undefined,
          enabled: true,
          source: undefined,
          method: method?.toUpperCase(),
          path: `${prefix}${routePath}`,
          module: prefix,
          middlewareCount,
        });
      }
    }
    return routes;
  }
  /* ------------------------------------------------------------
     DIAGNOSTIC HELPERS
     ------------------------------------------------------------ */
  public getModules(): ModuleMetadata[] {
    return this.discoverModules();
  }

  public getFailedModules(): FailedModuleMetadata[] {
    return this.discoverFailedModules();
  }

  public getDisabledModules(): ModuleMetadata[] {
    return this.discoverDisabledModules();
  }
  
  public getPlugins(): PluginMetadata[] {
    return this.discoverPlugins();
  }

  public getFailedPlugins(): FailedPluginMetadata[] {
    return this.discoverFailedPlugins();
  }

  public getDisabledPlugins(): PluginMetadata[] {
    return this.discoverDisabledPlugins();
  }

  public async getProviders(): Promise<ProviderMetadata[]> {
    return this.discoverProviders();
  }
  
  public getServices(): ServiceMetadata[] {
    return this.discoverServices();
  }
  
  public getRoutes(): RouteMetadata[] {
    return this.discoverRoutes();
  }
  
  /**
   * Returns a compact summary of what the framework has discovered.
   */
  public async getSummary() {
    const modules = this.discoverModules();
    const failedModules = this.discoverFailedModules();
    const disabledModules = this.discoverDisabledModules();
    const plugins = this.discoverPlugins();
    const failedPlugins = this.discoverFailedPlugins();
    const disabledPlugins = this.discoverDisabledPlugins();
    const services = this.discoverServices();
    const routes = this.discoverRoutes();
    const providers = await this.discoverProviders();
  
    return {
      modules: modules.length,
      failedModules: failedModules.length,
      disabledModules: disabledModules.length,
      plugins: plugins.length,
      failedPlugins: failedPlugins.length,
      disabledPlugins: disabledPlugins.length,
      providers: providers.length,
      services: services.length,
      routes: routes.length,
    };
  }

}
