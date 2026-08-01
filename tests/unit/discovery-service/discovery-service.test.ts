import { describe, it, expect, beforeEach, vi } from "vitest";
import { DiscoveryService } from "../../../apps/api/src/core/discovery/discovery.service.js";
import { container } from "../../../apps/api/src/core/container/container.js";
import { CORE_SERVICES } from "../../../apps/api/src/core/container/service.constants.js";
import { MODULE_SERVICES } from "../../../apps/api/src/core/modules/module.constants.js";
import { PLUGIN_SERVICES } from "../../../apps/api/src/core/plugins/plugin.constants.js";
import type { IModule } from "../../../apps/api/src/core/modules/module.interface.js";
import type { IPlugin } from "../../../apps/api/src/core/plugins/plugin.interface.js";
import type { IProvider } from "../../../apps/api/src/core/provider/provider.interface.js";

describe("DiscoveryService Unit", () => {
  let discovery: DiscoveryService;

  beforeEach(() => {
    container.reset();
    discovery = new DiscoveryService();
  });

  describe("discoverModules", () => {
    it("should return empty array when no modules registered", () => {
      const result = discovery.discoverModules();
      expect(result).toEqual([]);
    });

    it("should return metadata for registered modules", () => {
      const testModule: IModule = {
        name: "test-module",
        version: "1.0.0",
        description: "Test module",
      };

      const mockModuleManager = {
        getAll: () => [testModule],
        disabledModules: new Set<string>(),
      };

      container.register(MODULE_SERVICES.REGISTRY, mockModuleManager);

      const result = discovery.discoverModules();
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("test-module");
      expect(result[0].version).toBe("1.0.0");
      expect(result[0].description).toBe("Test module");
      expect(result[0].enabled).toBe(true);
    });

    it("should filter out disabled modules", () => {
      const activeModule: IModule = {
        name: "active-module",
        version: "1.0.0",
      };

      const disabledModule: IModule = {
        name: "disabled-module",
        version: "1.0.0",
      };

      const mockModuleManager = {
        getAll: () => [activeModule, disabledModule],
        disabledModules: new Set(["disabled-module"]),
      };

      container.register(MODULE_SERVICES.REGISTRY, mockModuleManager);

      const result = discovery.discoverModules();
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("active-module");
    });

    it("should return dependencies in metadata", () => {
      const moduleWithDeps: IModule = {
        name: "module-with-deps",
        version: "1.0.0",
        dependencies: ["dep1", "dep2"],
      };

      const mockModuleManager = {
        getAll: () => [moduleWithDeps],
        disabledModules: new Set<string>(),
      };

      container.register(MODULE_SERVICES.REGISTRY, mockModuleManager);

      const result = discovery.discoverModules();
      expect(result[0].dependencies).toEqual(["dep1", "dep2"]);
    });
  });

  describe("discoverPlugins", () => {
    it("should return empty array when no plugins registered", () => {
      const result = discovery.discoverPlugins();
      expect(result).toEqual([]);
    });

    it("should return metadata for registered plugins", () => {
      const testPlugin: IPlugin = {
        name: "test-plugin",
        version: "1.0.0",
        description: "Test plugin",
        providers: [],
      };

      const mockPluginManager = {
        getPlugins: () => [testPlugin],
      };

      container.register(PLUGIN_SERVICES.REGISTRY, mockPluginManager);

      const result = discovery.discoverPlugins();
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("test-plugin");
      expect(result[0].version).toBe("1.0.0");
      expect(result[0].description).toBe("Test plugin");
      expect(result[0].enabled).toBe(true);
    });
  });

  describe("discoverServices", () => {
    it("should return empty array when no services registered", () => {
      const result = discovery.discoverServices();
      expect(result).toEqual([]);
    });

    it("should return metadata for registered services", () => {
      const mockContainer = {
        definitions: new Map([
          ["testService", { scope: "singleton", factory: () => ({}) }],
        ]),
        singletons: new Map(),
      };

      container.register("testService", { scope: "singleton", instance: {} });

      const result = discovery.discoverServices();
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("testService");
      expect(result[0].key).toBe("testService");
    });

    it("should correctly identify resolved vs transient services", () => {
      container.registerSingleton("singletonService", () => ({ data: "singleton" }));
      container.registerTransient("transientService", () => ({ data: "transient" }));

      const result = discovery.discoverServices();
      const singleton = result.find(s => s.name === "singletonService");
      const transient = result.find(s => s.name === "transientService");

      expect(singleton?.resolved).toBe(false);
      expect(transient?.resolved).toBe(false);
    });
  });

  describe("discoverRoutes", () => {
    it("should return empty array when no routes registered", () => {
      const result = discovery.discoverRoutes();
      expect(result).toEqual([]);
    });

    it("should return metadata for registered routes", () => {
      const mockRouter = {
        registry: new Map([
          [
            "/api/v1/test",
            {
              router: {
                stack: [
                  {
                    route: { path: "/users", methods: { get: true, post: true } },
                  },
                ],
              },
            },
          ],
        ]),
      };

      container.register(CORE_SERVICES.ROUTER, mockRouter);

      const result = discovery.discoverRoutes();
      expect(result).toHaveLength(1);
      expect(result[0].path).toContain("/users");
    });
  });

  describe("discoverProviders", () => {
    it("should return empty array when no providers registered", async () => {
      const result = await discovery.discoverProviders();
      expect(result).toEqual([]);
    });

    it("should return metadata for registered providers", async () => {
      const testProvider: IProvider = {
        name: "test-provider",
        type: "storage",
        version: "1.0.0",
        enabled: true,
      };

      const mockProviderManager = {
        getDiagnostics: async () => [testProvider],
      };

      container.register(CORE_SERVICES.PROVIDER_MANAGER, mockProviderManager);

      const result = await discovery.discoverProviders();
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("test-provider");
      expect(result[0].type).toBe("storage");
    });
  });

  describe("discoverStorage", () => {
    it("should return undefined when no storage service registered", () => {
      const result = discovery.discoverStorage();
      expect(result).toBeUndefined();
    });

    it("should return storage metadata when storage is registered", () => {
      const mockStorageService = {
        getDiagnostics: () => ({
          activeProvider: "local",
          registeredProviders: ["local"],
          statistics: { totalBytes: 1024, totalFiles: 5 },
        }),
      };

      container.register(CORE_SERVICES.STORAGE, mockStorageService);

      const result = discovery.discoverStorage();
      expect(result).toBeDefined();
      expect(result?.activeProvider).toBe("local");
      expect(result?.registeredProviders).toContain("local");
    });
  });

  describe("getSummary", () => {
    it("should return correct counts", async () => {
      const testModule: IModule = { name: "test", version: "1.0.0" };
      container.register(MODULE_SERVICES.REGISTRY, {
        getAll: () => [testModule],
        disabledModules: new Set(),
      });

      container.register(CORE_SERVICES.ROUTER, { registry: new Map() });

      const summary = await discovery.getSummary();
      expect(summary).toHaveProperty("modules");
      expect(summary).toHaveProperty("plugins");
      expect(summary).toHaveProperty("services");
      expect(summary).toHaveProperty("routes");
      expect(summary).toHaveProperty("summary");
    });

    it("should count modules correctly", async () => {
      const modules: IModule[] = [
        { name: "module1", version: "1.0" },
        { name: "module2", version: "1.0" },
        { name: "module3", version: "1.0" },
      ];

      container.register(MODULE_SERVICES.REGISTRY, {
        getAll: () => modules,
        disabledModules: new Set(),
      });

      const summary = await discovery.getSummary();
      expect(summary.modules).toBe(3);
    });

    it("should count routes correctly", async () => {
      const mockRouter = {
        registry: new Map([
          ["/api/v1/users", { router: { stack: [{ route: { path: "/users", methods: { get: true } } }] } }],
          ["/api/v1/posts", { router: { stack: [{ route: { path: "/posts", methods: { get: true } } }] } }],
        ]),
      };

      container.register(CORE_SERVICES.ROUTER, mockRouter);

      const summary = await discovery.getSummary();
      expect(summary.routes).toBe(2);
    });
  });

  describe("getModuleDependencyGraph", () => {
    it("should return empty object when no modules", () => {
      const result = discovery.getModuleDependencyGraph();
      expect(result).toEqual({});
    });

    it("should return dependency graph for modules with dependencies", () => {
      const moduleWithDeps: IModule = {
        name: "dependent-module",
        version: "1.0.0",
        dependencies: ["dep1", "dep2"],
      };

      container.register(MODULE_SERVICES.REGISTRY, {
        getAll: () => [moduleWithDeps],
        disabledModules: new Set(),
      });

      const result = discovery.getModuleDependencyGraph();
      expect(result).toEqual({
        "dependent-module": ["dep1", "dep2"],
      });
    });
  });

  describe("getModuleBootOrder", () => {
    it("should return boot order for modules", () => {
      const module1: IModule = { name: "module1", version: "1.0" };
      const module2: IModule = { name: "module2", version: "1.0", dependencies: ["module1"] };

      container.register(MODULE_SERVICES.REGISTRY, {
        getAll: () => [module1, module2],
        disabledModules: new Set(),
        getTopologicallySortedModules: () => [module1, module2],
      });

      const result = discovery.getModuleBootOrder();
      expect(result).toContain("module1");
      expect(result).toContain("module2");
    });
  });

  describe("getFailedModules", () => {
    it("should return failed modules", () => {
      // The test uses ModuleLoader.failedModules which is a static property
      const result = discovery.discoverFailedModules();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("getDisabledModules", () => {
    it("should return disabled modules", () => {
      const result = discovery.discoverDisabledModules();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("getFailedPlugins", () => {
    it("should return failed plugins", () => {
      // The test uses PluginLoader.failedPlugins which is a static property
      const result = discovery.discoverFailedPlugins();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("getDisabledPlugins", () => {
    it("should return disabled plugins", () => {
      const result = discovery.discoverDisabledPlugins();
      expect(Array.isArray(result)).toBe(true);
    });
  });
});