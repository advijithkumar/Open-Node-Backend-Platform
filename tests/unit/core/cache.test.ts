import { describe, it, expect, vi, beforeEach } from "vitest";
import { CacheManager } from "../../../apps/api/src/core/cache/cache-manager.js";
import { MemoryCacheProvider } from "../../../apps/api/src/core/cache/memory-cache.provider.js";
import { container } from "../../../apps/api/src/core/container/container.js";
import { CORE_SERVICES } from "../../../apps/api/src/core/container/service.constants.js";

describe("Cache Framework Unit Tests", () => {
  let cacheManager: CacheManager;
  let eventBus: any;

  beforeEach(() => {
    vi.clearAllMocks();

    eventBus = {
      emit: vi.fn().mockResolvedValue(undefined),
    };

    // Clean container and register mocks
    const definitions = (container as any).definitions;
    definitions.delete(CORE_SERVICES.EVENT_BUS);
    const singletons = (container as any).singletons;
    singletons.delete(CORE_SERVICES.EVENT_BUS);

    container.registerSingleton(CORE_SERVICES.EVENT_BUS, () => eventBus);

    cacheManager = new CacheManager();
  });

  describe("Cache CRUD and Advanced Operations (Memory)", () => {
    it("should set, get, has, and delete cache keys", async () => {
      await cacheManager.set("test-key", "hello-world", 10);
      
      expect(await cacheManager.has("test-key")).toBe(true);
      expect(await cacheManager.get("test-key")).toBe("hello-world");

      await cacheManager.delete("test-key");
      expect(await cacheManager.get("test-key")).toBeUndefined();
    });

    it("should clear the cache", async () => {
      await cacheManager.set("k1", "v1");
      await cacheManager.set("k2", "v2");
      await cacheManager.clear();

      expect(await cacheManager.get("k1")).toBeUndefined();
      expect(await cacheManager.get("k2")).toBeUndefined();
    });

    it("should support increment and decrement", async () => {
      await cacheManager.set("counter", 10);
      const inc = await cacheManager.increment("counter", 5);
      expect(inc).toBe(15);

      const dec = await cacheManager.decrement("counter", 2);
      expect(dec).toBe(13);
    });

    it("should expire key with new TTL", async () => {
      await cacheManager.set("temp", "val");
      const expired = await cacheManager.expire("temp", 3600);
      expect(expired).toBe(true);
    });

    it("should find keys matching wildcard pattern", async () => {
      await cacheManager.set("user:1:profile", "p1");
      await cacheManager.set("user:2:profile", "p2");
      await cacheManager.set("system:config", "cfg");

      const match = await cacheManager.keys("user:*:profile");
      expect(match).toContain("user:1:profile");
      expect(match).toContain("user:2:profile");
      expect(match).not.toContain("system:config");
    });
  });

  describe("Provider Switching & Health", () => {
    it("should switch between registered providers", async () => {
      const customProvider = new MemoryCacheProvider();
      cacheManager.registerProvider("custom", customProvider);
      
      await customProvider.set("k", "custom-val");
      cacheManager.use("custom");

      expect(await cacheManager.get("k")).toBe("custom-val");
    });

    it("should verify health status", async () => {
      const health = await cacheManager.getHealth();
      expect(health.status).toBe("healthy");
    });

    it("should report diagnostics statistics", async () => {
      await cacheManager.set("k", "v");
      await cacheManager.get("k");
      await cacheManager.get("missing");

      const diags = cacheManager.getDiagnostics();
      expect(diags.activeProvider).toBe("memory");
      expect(diags.statistics.hits).toBe(1);
      expect(diags.statistics.misses).toBe(1);
      expect(diags.statistics.sets).toBe(1);
    });
  });

  describe("Event Triggers", () => {
    it("should trigger cache events on mutations", async () => {
      await cacheManager.set("k", "v");
      expect(eventBus.emit).toHaveBeenCalledWith("cache.set", { key: "k", ttlSeconds: undefined });

      await cacheManager.get("k");
      expect(eventBus.emit).toHaveBeenCalledWith("cache.hit", { key: "k" });

      await cacheManager.get("missing");
      expect(eventBus.emit).toHaveBeenCalledWith("cache.miss", { key: "missing" });

      await cacheManager.delete("k");
      expect(eventBus.emit).toHaveBeenCalledWith("cache.deleted", { key: "k" });

      await cacheManager.clear();
      expect(eventBus.emit).toHaveBeenCalledWith("cache.cleared", {});
    });
  });
});
