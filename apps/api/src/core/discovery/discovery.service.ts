/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Discovery Service – singleton used by the Kernel.
 * Provides metadata about modules, plugins, providers, services, storage, and routes.
 */

import { container } from "../container/index.js";
import { CORE_SERVICES } from "../container/service.constants.js";
import { PLUGIN_SERVICES } from "../plugins/plugin.constants.js";
import { MODULE_SERVICES } from "../modules/module.constants.js";
import type { 
  IDiscoveryService, 
  ModuleMetadata, 
  FailedModuleMetadata, 
  PluginMetadata, 
  FailedPluginMetadata, 
  ProviderMetadata, 
  ServiceMetadata, 
  RouteMetadata,
  StorageMetadata
} from "./discovery.interface.js";
import type { IModule } from "../modules/module.interface.js";
import { PluginLoader } from "../plugins/plugin.loader.js";
import { ModuleLoader } from "../modules/module.loader.js";

/**
 * Central discovery service – a singleton registered in the kernel.
 * Provides metadata for all discovered framework components.
 */
export class DiscoveryService implements IDiscoveryService {
  constructor() {
    // No-op – the service starts empty.
  }

  /** Return storage metadata */
  discoverStorage(): StorageMetadata | undefined {
    if (!container.has(CORE_SERVICES.STORAGE)) {
      return undefined;
    }
    try {
      const storageService = container.resolve<any>(CORE_SERVICES.STORAGE);
      const diagnostics = storageService.getDiagnostics();
      const activeProvider = diagnostics.activeProvider || "local";
      return {
        name: "storage",
        version: "1.0.0",
        description: "Storage service for file operations",
        enabled: true,
        activeProvider,
        registeredProviders: diagnostics.registeredProviders || [],
      };
    } catch {
      return undefined;
    }
  }

  /** Return metadata for all registered modules */
  discoverModules(): ModuleMetadata[] {
    // Resolve the ModuleManager from the global container.
    if (!container.has(MODULE_SERVICES.REGISTRY)) {
      return [];
    }
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
        dependencies: mod.dependencies,
      }));
  }

  /** Return failed module metadata */
  discoverFailedModules(): FailedModuleMetadata[] {
    return ModuleLoader.failedModules;
  }

  /** Return disabled module metadata */
  discoverDisabledModules(): ModuleMetadata[] {
    if (!container.has(MODULE_SERVICES.REGISTRY)) {
      return [];
    }
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
    if (!container.has(MODULE_SERVICES.REGISTRY)) {
      return {};
    }
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
    if (!container.has(MODULE_SERVICES.REGISTRY)) {
      return [];
    }
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
    if (!container.has(PLUGIN_SERVICES.REGISTRY)) {
      return [];
    }
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
    if (!container.has(PLUGIN_SERVICES.REGISTRY)) {
      return [];
    }
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
    if (!container.has(CORE_SERVICES.PROVIDER_MANAGER)) {
      return [];
    }
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
      // For singleton services: resolved if already in singletons map or has instance
      // For transient services: resolved only if has pre-defined instance
      const isSingleton = def.scope === "singleton";
      const resolved = isSingleton ? (singletons.has(key) || !!def.instance) : !!def.instance;
      services.push({
        name: key,
        version: "",
        description: undefined,
        enabled: true,
        source: undefined,
        key,
        scope: def.scope as any,
        resolved,
      });
    }
    return services;
  }

  /** Return metadata for all registered routes */
  discoverRoutes(): RouteMetadata[] {
    if (!container.has(CORE_SERVICES.ROUTER)) {
      return [];
    }
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
  /** Get modules */
  getModules(): ModuleMetadata[] {
    return this.discoverModules();
  }

  /** Get failed modules */
  getFailedModules(): FailedModuleMetadata[] {
    return this.discoverFailedModules();
  }

  /** Get disabled modules */
  getDisabledModules(): ModuleMetadata[] {
    return this.discoverDisabledModules();
  }

  /** Get plugins */
  getPlugins(): PluginMetadata[] {
    return this.discoverPlugins();
  }

  /** Get failed plugins */
  getFailedPlugins(): FailedPluginMetadata[] {
    return this.discoverFailedPlugins();
  }

  /** Get disabled plugins */
  getDisabledPlugins(): PluginMetadata[] {
    return this.discoverDisabledPlugins();
  }

  /** Get providers */
  async getProviders(): Promise<ProviderMetadata[]> {
    return this.discoverProviders();
  }

  /** Get services */
  getServices(): ServiceMetadata[] {
    return this.discoverServices();
  }

  /** Get routes */
  getRoutes(): RouteMetadata[] {
    return this.discoverRoutes();
  }

  /** Get storage metadata */
  getStorage(): StorageMetadata | undefined {
    return this.discoverStorage();
  }

  /** Get authorization diagnostics */
  public getAuthorizationDiagnostics() {
    try {
      if (container.has("authorizationService")) {
        const authService = container.resolve<any>("authorizationService");
        return authService.getDiagnostics();
      }
    } catch {
      // Fallback
    }
    return {
      service: "AuthorizationService",
      status: "inactive",
      registeredGuards: [],
      protectedRouteCount: 0,
      cacheStatus: { hits: 0, misses: 0, ratio: "0.00" }
    };
  }

  /** Get event diagnostics */
  public getEventDiagnostics() {
    try {
      if (container.has(CORE_SERVICES.EVENT_BUS)) {
        const eventBus = container.resolve<any>(CORE_SERVICES.EVENT_BUS);
        return eventBus.getDiagnostics();
      }
    } catch {
      // Fallback
    }
    return {
      totalEventsRegistered: 0,
      totalSubscribers: 0,
      publishedCount: 0,
      asyncPublishedCount: 0,
      failureCount: 0,
    };
  }

  /** Get cache diagnostics */
  public async getCacheDiagnostics() {
    try {
      if (container.has(CORE_SERVICES.CACHE)) {
        const cacheService = container.resolve<any>(CORE_SERVICES.CACHE);
        const manager = cacheService.getManager();
        const health = await manager.getHealth();
        const diags = manager.getDiagnostics();
        return {
          activeProvider: diags.activeProvider,
          registeredProviders: diags.registeredProviders,
          health: health.status,
          statistics: diags.statistics,
        };
      }
    } catch {
      // Fallback
    }
    return {
      activeProvider: "none",
      registeredProviders: [],
      health: "unhealthy",
      statistics: { hits: 0, misses: 0, sets: 0, deletes: 0, clears: 0 }
    };
  }

  /** Get queue diagnostics */
  public async getQueueDiagnostics() {
    try {
      if (container.has(CORE_SERVICES.QUEUE)) {
        const queueService = container.resolve<any>(CORE_SERVICES.QUEUE);
        const health = await queueService.getHealth();
        const diags = queueService.getDiagnostics();
        return {
          activeProvider: diags.activeProvider,
          registeredProviders: diags.registeredProviders,
          registeredQueues: diags.registeredQueues,
          health: health.status,
          statistics: diags.statistics,
        };
      }
    } catch {
      // Fallback
    }
    return {
      activeProvider: "none",
      registeredProviders: [],
      registeredQueues: [],
      health: "unhealthy",
      statistics: { enqueued: 0, completed: 0, failed: 0 }
    };
  }

  /** Get storage diagnostics */
  public async getStorageDiagnostics() {
    try {
      if (container.has(CORE_SERVICES.STORAGE)) {
        const storageService = container.resolve<any>(CORE_SERVICES.STORAGE);
        const health = await storageService.getHealth();
        const diagnostics = storageService.getDiagnostics();
        return {
          activeProvider: diagnostics.activeProvider,
          registeredProviders: diagnostics.registeredProviders,
          health: health.status,
          statistics: diagnostics.statistics,
        };
      }
    } catch {
      // Fallback
    }
    return {
      activeProvider: "none",
      registeredProviders: [],
      health: "unhealthy",
      statistics: { totalBytes: 0, totalFiles: 0 }
    };
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
    const storage = this.discoverStorage();
    const authDiags = this.getAuthorizationDiagnostics();
    const eventDiags = this.getEventDiagnostics();
    const cacheDiags = await this.getCacheDiagnostics();
    const queueDiags = await this.getQueueDiagnostics();
    const storageDiags = await this.getStorageDiagnostics();
    
    const totalComponents = modules.length + plugins.length + services.length + routes.length;
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
      storage: storage ? 1 : 0,
      authorization: authDiags,
      events: eventDiags,
      cache: cacheDiags,
      queue: queueDiags,
      storageDiagnostics: storageDiags,
      summary: {
        totalComponents,
        totalModules: modules.length,
        totalPlugins: plugins.length,
        totalServices: services.length,
        totalRoutes: routes.length
      }
    };
  }
}