/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Core discovery service interface – used by the Kernel to expose
 * generic metadata about modules, plugins, services and routes.
 *
 * All metadata objects share a small set of common properties.
 */
export interface BaseMetadata {
  /** Unique identifier */
  readonly name: string;
  /** Semantic version */
  readonly version: string;
  /** Human-readable description */
  readonly description?: string;
  /** Whether the entity is currently enabled */
  readonly enabled?: boolean;
  /** Source location (file path, package name, etc.) */
  readonly source?: string;
}

/** Specific metadata for a module */
export interface ModuleMetadata extends BaseMetadata {
  /** Dependencies on other modules */
  readonly dependencies?: string[];
}

/** Specific metadata for a plugin */
export interface PluginMetadata extends BaseMetadata {
  readonly providerCount?: number;
}

/** Specific metadata for a provider */
export interface ProviderMetadata extends BaseMetadata {
  readonly type: string;
  readonly plugin?: string;
  readonly health?: string | Record<string, any>;
}

/** Storage-specific metadata */
export interface StorageMetadata extends BaseMetadata {
  /** Active storage provider name */
  readonly activeProvider: string;
  /** Registered storage providers */
  readonly registeredProviders: string[];
}

/** Specific metadata for a service (e.g., storage, cache) */
export type ServiceScope = "singleton" | "transient" | "scoped";

export interface ServiceMetadata extends BaseMetadata {
  /** The DI container key */
  readonly key: string;
  /** How the service was registered */
  readonly scope: ServiceScope;
  /** Whether an instance has already been created/resolved */
  readonly resolved: boolean;
}

/** Specific metadata for a route */
export interface RouteMetadata extends BaseMetadata {
  /** HTTP method (GET, POST, ...) */
  readonly method?: string;
  /** Full path including prefix */
  readonly path?: string;
  /** Module name that owns this router (derived from prefix) */
  readonly module?: string;
  /** Number of middleware functions attached to this route */
  readonly middlewareCount?: number;
}

export interface FailedPluginMetadata {
  readonly name: string;
  readonly error: string;
}

export interface FailedModuleMetadata {
  readonly name: string;
  readonly error: string;
}

/** The public discovery service contract - the actual implementation
 * will be provided at runtime.  Keeping it separate makes it easy to
 * mock in tests.
 */
export interface IDiscoveryService {
  /** Return module metadata */
  discoverModules(): ModuleMetadata[];
  /** Return failed module metadata */
  discoverFailedModules(): FailedModuleMetadata[];
  /** Return disabled module metadata */
  discoverDisabledModules(): ModuleMetadata[];
  /** Return module dependency graph */
  getModuleDependencyGraph(): Record<string, string[]>;
  /** Return module boot order */
  getModuleBootOrder(): string[];
  /** Return plugin metadata */
  discoverPlugins(): PluginMetadata[];
  /** Return failed plugin metadata */
  discoverFailedPlugins(): FailedPluginMetadata[];
  /** Return disabled plugin metadata */
  discoverDisabledPlugins(): PluginMetadata[];
  /** Return provider metadata */
  discoverProviders(): Promise<ProviderMetadata[]> | ProviderMetadata[];
  /** Return storage metadata */
  discoverStorage(): StorageMetadata | undefined;
  /** Return service metadata */
  discoverServices(): ServiceMetadata[];
  /** Return route metadata */
  discoverRoutes(): RouteMetadata[];
  /** Get modules */
  getModules(): ModuleMetadata[];
  /** Get failed modules */
  getFailedModules(): FailedModuleMetadata[];
  /** Get disabled modules */
  getDisabledModules(): ModuleMetadata[];
  /** Get plugins */
  getPlugins(): PluginMetadata[];
  /** Get failed plugins */
  getFailedPlugins(): FailedPluginMetadata[];
  /** Get disabled plugins */
  getDisabledPlugins(): PluginMetadata[];
  /** Get providers */
  getProviders(): Promise<ProviderMetadata[]> | ProviderMetadata[];
  /** Get services */
  getServices(): ServiceMetadata[];
  /** Get routes */
  getRoutes(): RouteMetadata[];
  /** Get summary of discovered components */
  getSummary(): Promise<Record<string, any>>;
}