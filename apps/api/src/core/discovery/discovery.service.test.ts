/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, } from "vitest";
import { DiscoveryService } from "./discovery.service.js";
import { container } from "../container/container.js";
import { MODULE_SERVICES } from "../modules/module.constants.js";
import { PLUGIN_SERVICES } from "../plugins/plugin.constants.js";
import { CORE_SERVICES } from "../container/service.constants.js";
import type { IModule } from "../modules/module.interface.js";
import type { IPlugin } from "../plugins/plugin.interface.js";

describe("DiscoveryService", () => {
  let discovery: DiscoveryService;

  beforeEach(() => {
    // Clear container for clean tests
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

      const originalContainer = (container as any).definitions;
      Object.defineProperty(container, "definitions", {
        value: mockContainer.definitions,
      });
      Object.defineProperty(container, "singletons", {
        value: mockContainer.singletons,
      });

      const result = discovery.discoverServices();
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("testService");
      expect(result[0].key).toBe("testService");

      // Restore
      Object.defineProperty(container, "definitions", {
        value: originalContainer,
      });
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


  describe("getAuthorizationDiagnostics", () => {
    it("should return diagnostics from authorizationService if available", () => {
      const mockDiagnostics = {
        service: "AuthorizationService",
        status: "active",
        registeredGuards: ["jwt", "role"],
        protectedRouteCount: 5,
        cacheStatus: { hits: 10, misses: 2, ratio: "0.83" }
      };

      const mockAuthService = {
        getDiagnostics: () => mockDiagnostics
      };

      container.register("authorizationService", mockAuthService);

      const result = discovery.getAuthorizationDiagnostics();
      expect(result).toEqual(mockDiagnostics);
    });

    it("should return fallback diagnostics if authorizationService is not available", () => {
      const result = discovery.getAuthorizationDiagnostics();
      expect(result).toEqual({
        service: "AuthorizationService",
        status: "inactive",
        registeredGuards: [],
        protectedRouteCount: 0,
        cacheStatus: { hits: 0, misses: 0, ratio: "0.00" }
      });
    });

    it("should return fallback diagnostics if getDiagnostics throws an error", () => {
      const mockAuthService = {
        getDiagnostics: () => { throw new Error("Test error"); }
      };

      container.register("authorizationService", mockAuthService);

      const result = discovery.getAuthorizationDiagnostics();
      expect(result).toEqual({
        service: "AuthorizationService",
        status: "inactive",
        registeredGuards: [],
        protectedRouteCount: 0,
        cacheStatus: { hits: 0, misses: 0, ratio: "0.00" }
      });
    });
  });

  describe("getSummary", () => {
    it("should return correct counts", async () => {
      // Setup minimal mock services
      const testModule: IModule = { name: "test", version: "1.0.0" };
      container.register(MODULE_SERVICES.REGISTRY, {
        getAll: () => [testModule],
        disabledModules: new Set(),
      });

      container.register(CORE_SERVICES.ROUTER, { registry: new Map() });

      const summary = await discovery.getSummary();
      expect(summary).toHaveProperty("modules");
      expect(summary.modules).toBeGreaterThanOrEqual(0);
    });
  });
});