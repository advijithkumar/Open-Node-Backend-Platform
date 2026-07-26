import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";
import { RedisPlugin } from "../../../apps/api/src/plugins/redis/plugin.js";
import { RedisProvider } from "../../../apps/api/src/plugins/redis/provider.js";
import { Container } from "../../../apps/api/src/core/container/index.js";
import { container as globalContainer } from "../../../apps/api/src/core/container/container.js";
import { CORE_SERVICES } from "../../../apps/api/src/core/container/service.constants.js";
import { REDIS_CONSTANTS } from "../../../apps/api/src/plugins/redis/constants.js";

describe("Redis Plugin & Provider", () => {
  let mockRedis: any;

  beforeAll(() => {
    // Register mock config manager on the global container for config.ts resolution
    const mockConfigManager = {
      get: (key: string, defaultValue?: any) => {
        if (key === "plugins.redis.enabled") return true;
        if (key === "redis.host") return "localhost";
        if (key === "redis.port") return 6379;
        return defaultValue;
      }
    };
    
    const definitions = (globalContainer as any).definitions;
    definitions.delete(CORE_SERVICES.CONFIG);
    
    globalContainer.registerSingleton(CORE_SERVICES.CONFIG, () => mockConfigManager);
  });

  beforeEach(() => {
    mockRedis = {
      ping: vi.fn().mockResolvedValue("PONG"),
      quit: vi.fn().mockResolvedValue("OK"),
      on: vi.fn(),
    };
  });

  it("should have correct metadata and defaults", () => {
    const plugin = new RedisPlugin();
    expect(plugin.name).toBe("redis");
    expect(plugin.version).toBe("1.0.0");
    expect(plugin.providers.length).toBe(1);

    const provider = plugin.providers[0];
    expect(provider.name).toBe("redis");
    expect(provider.type).toBe("cache");
  });

  it("should register client singleton into the container", async () => {
    const plugin = new RedisPlugin();
    const container = new Container();

    await plugin.register(container);

    // Inject mock redis client and boot the provider
    const provider = plugin.providers[0] as RedisProvider;
    provider.setClient(mockRedis);
    await provider.boot();

    const client = container.resolve<any>(REDIS_CONSTANTS.CLIENT_KEY);
    expect(client).toBeDefined();
    await client.ping();
    expect(mockRedis.ping).toHaveBeenCalled();
  });

  it("should support health and diagnostics reporting", async () => {
    const provider = new RedisProvider();
    provider.setClient(mockRedis);
    await provider.boot();

    const health = await provider.health();
    expect(health.status).toBe("healthy");

    const diags = await provider.diagnostics();
    expect(diags.enabled).toBe(true);
    expect(diags.hasClient).toBe(true);

    await provider.shutdown();
    expect(mockRedis.quit).toHaveBeenCalled();
  });

  it("should fail gracefully on boot ping connection error", async () => {
    const provider = new RedisProvider();
    const badRedis = {
      ping: vi.fn().mockRejectedValue(new Error("Connection refused")),
      on: vi.fn(),
    };
    provider.setClient(badRedis as any);
    
    await expect(provider.boot()).rejects.toThrow("Failed to verify injected database connection");
    expect(provider.enabled).toBe(false);
  });

  it("should report unhealthy status on query failure", async () => {
    const provider = new RedisProvider();
    const badRedis = {
      ping: vi.fn().mockRejectedValue(new Error("Redis disconnected")),
      on: vi.fn(),
    };
    provider.setClient(badRedis as any);
    
    const health = await provider.health();
    expect(health.status).toBe("unhealthy");
    expect(health.reason).toBe("Redis disconnected");
  });
});
