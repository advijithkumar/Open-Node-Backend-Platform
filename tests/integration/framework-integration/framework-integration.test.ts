import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { registerCore } from "../../../apps/api/src/bootstrap/register-core.js";
import { registerModules } from "../../../apps/api/src/bootstrap/register-modules.js";
import { registerRoutes } from "../../../apps/api/src/bootstrap/register-routes.js";
import { container } from "../../../apps/api/src/core/container/container.js";
import { CORE_SERVICES } from "../../../apps/api/src/core/container/service.constants.js";
import { KERNEL_SERVICES } from "../../../apps/api/src/core/kernel/kernel.constants.js";
import { MODULE_SERVICES } from "../../../apps/api/src/core/modules/module.constants.js";
import { PLUGIN_SERVICES } from "../../../apps/api/src/core/plugins/plugin.constants.js";
import type { DiscoveryService } from "../../../apps/api/src/core/discovery/index.js";
import type { Kernel } from "../../../apps/api/src/core/kernel/index.js";

describe("Full Framework Integration", () => {
  beforeAll(async () => {
    await registerCore();
  });

  afterAll(() => {
    container.reset();
  });

  describe("Core Services Registration", () => {
    it("should register all core services", () => {
      expect(container.has(CORE_SERVICES.EVENT_BUS)).toBe(true);
      expect(container.has(CORE_SERVICES.ROUTER)).toBe(true);
      expect(container.has(CORE_SERVICES.STORAGE)).toBe(true);
      expect(container.has(CORE_SERVICES.CACHE)).toBe(true);
      expect(container.has(CORE_SERVICES.QUEUE)).toBe(true);
      expect(container.has(CORE_SERVICES.SCHEDULER)).toBe(true);
      expect(container.has(CORE_SERVICES.AI)).toBe(true);
      expect(container.has(CORE_SERVICES.HEALTH)).toBe(true);
      expect(container.has(CORE_SERVICES.CONFIG)).toBe(true);
      expect(container.has(CORE_SERVICES.DISCOVERY)).toBe(true);
      expect(container.has(CORE_SERVICES.PROVIDER_MANAGER)).toBe(true);
    });

    it("should register module manager", () => {
      expect(container.has(MODULE_SERVICES.REGISTRY)).toBe(true);
    });

    it("should register plugin manager", () => {
      expect(container.has(PLUGIN_SERVICES.REGISTRY)).toBe(true);
    });

    it("should register kernel", () => {
      expect(container.has(KERNEL_SERVICES.KERNEL)).toBe(true);
    });
  });

  describe("Kernel Service Exposure", () => {
    it("should expose Kernel with all services", () => {
      const kernel = container.resolve<Kernel>(KERNEL_SERVICES.KERNEL);

      expect(kernel).toBeDefined();
      expect(kernel.router).toBeDefined();
      expect(kernel.health).toBeDefined();
      expect(kernel.storage).toBeDefined();
      expect(kernel.cache).toBeDefined();
      expect(kernel.queue).toBeDefined();
      expect(kernel.scheduler).toBeDefined();
      expect(kernel.ai).toBeDefined();
      expect(kernel.provider).toBeDefined();
      expect(kernel.config).toBeDefined();
      expect(kernel.discovery).toBeDefined();
    });
  });

  describe("DiscoveryService", () => {
    let discovery: DiscoveryService;

    beforeAll(() => {
      discovery = container.resolve<DiscoveryService>(CORE_SERVICES.DISCOVERY);
    });

    it("should return empty modules when none loaded", () => {
      const modules = discovery.getModules();
      expect(modules).toBeDefined();
      expect(Array.isArray(modules)).toBe(true);
    });

    it("should return empty plugins when none loaded", () => {
      const plugins = discovery.getPlugins();
      expect(plugins).toBeDefined();
      expect(Array.isArray(plugins)).toBe(true);
    });

    it("should return empty routes when none registered", () => {
      const routes = discovery.discoverRoutes();
      expect(routes).toBeDefined();
      expect(Array.isArray(routes)).toBe(true);
    });

    it("should return summary", async () => {
      const summary = await discovery.getSummary();
      expect(summary).toHaveProperty("modules");
      expect(summary).toHaveProperty("plugins");
      expect(summary).toHaveProperty("services");
      expect(summary).toHaveProperty("routes");
    });

    it("should return storage metadata when storage is registered", () => {
      const storageMeta = discovery.discoverStorage();
      expect(storageMeta).toBeDefined();
      expect(storageMeta?.name).toBe("storage");
    });
  });

  describe("StorageService", () => {
    it("should be accessible via kernel.storage", () => {
      const kernel = container.resolve<Kernel>(KERNEL_SERVICES.KERNEL);
      const storage = kernel.storage;

      expect(storage).toBeDefined();
      expect(storage.upload).toBeDefined();
      expect(storage.download).toBeDefined();
      expect(storage.delete).toBeDefined();
      expect(storage.exists).toBeDefined();
      expect(storage.list).toBeDefined();
      expect(storage.copy).toBeDefined();
      expect(storage.move).toBeDefined();
      expect(storage.getMetadata).toBeDefined();
      expect(storage.generateSignedUrl).toBeDefined();
      expect(storage.createBucket).toBeDefined();
      expect(storage.deleteBucket).toBeDefined();
      expect(storage.bucketExists).toBeDefined();
      expect(storage.listBuckets).toBeDefined();
      expect(storage.getStorageStats).toBeDefined();
      expect(storage.getHealth).toBeDefined();
      expect(storage.getDiagnostics).toBeDefined();
    });
  });
});

describe("Module and Plugin Integration", () => {
  beforeAll(async () => {
    await registerCore();
    await registerModules();
    await registerRoutes();
  });

  afterAll(() => {
    container.reset();
  });

  it("should discover registered modules", () => {
    const discovery = container.resolve<DiscoveryService>(CORE_SERVICES.DISCOVERY);
    const modules = discovery.discoverModules();

    // Modules should be discovered from the modules directory
    expect(modules).toBeDefined();
    expect(Array.isArray(modules)).toBe(true);
  });

  it("should discover registered routes", () => {
    const discovery = container.resolve<DiscoveryService>(CORE_SERVICES.DISCOVERY);
    const routes = discovery.discoverRoutes();

    // Routes should be discovered from the router manager
    expect(routes).toBeDefined();
    expect(Array.isArray(routes)).toBe(true);
  });
});