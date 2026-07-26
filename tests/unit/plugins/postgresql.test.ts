import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";
import { PostgresqlPlugin } from "../../../apps/api/src/plugins/postgresql/plugin.js";
import { PostgresqlProvider } from "../../../apps/api/src/plugins/postgresql/provider.js";
import { Container } from "../../../apps/api/src/core/container/index.js";
import { container as globalContainer } from "../../../apps/api/src/core/container/container.js";
import { CORE_SERVICES } from "../../../apps/api/src/core/container/service.constants.js";
import { POSTGRESQL_CONSTANTS } from "../../../apps/api/src/plugins/postgresql/constants.js";

describe("PostgreSQL Plugin & Provider", () => {
  let mockSql: any;

  beforeAll(() => {
    // Register mock config manager on the global container for config.ts resolution
    const mockConfigManager = {
      get: (key: string, defaultValue?: any) => {
        if (key === "plugins.postgresql.enabled") return true;
        if (key === "database.max") return 10;
        if (key === "database.idle_timeout") return 30;
        return defaultValue;
      }
    };
    
    const definitions = (globalContainer as any).definitions;
    definitions.delete(CORE_SERVICES.CONFIG);
    
    globalContainer.registerSingleton(CORE_SERVICES.CONFIG, () => mockConfigManager);
  });

  beforeEach(() => {
    mockSql = Object.assign(
      vi.fn().mockImplementation(() => Promise.resolve([{ "1": 1 }])),
      { end: vi.fn().mockResolvedValue(undefined) }
    );
  });

  it("should have correct metadata and defaults", () => {
    const plugin = new PostgresqlPlugin();
    expect(plugin.name).toBe("postgresql");
    expect(plugin.version).toBe("1.0.0");
    expect(plugin.providers.length).toBe(1);

    const provider = plugin.providers[0];
    expect(provider.name).toBe("postgresql");
    expect(provider.type).toBe("database");
  });

  it("should register client singleton into the container", async () => {
    const plugin = new PostgresqlPlugin();
    const container = new Container();

    await plugin.register(container);

    // Inject mock sql client and boot the provider
    const provider = plugin.providers[0] as PostgresqlProvider;
    provider.setClient(mockSql);
    await provider.boot();

    const client = container.resolve<any>(POSTGRESQL_CONSTANTS.CLIENT_KEY);
    expect(client).toBeDefined();
    await client`SELECT 1`;
    expect(mockSql).toHaveBeenCalled();
  });

  it("should support health and diagnostics reporting", async () => {
    const provider = new PostgresqlProvider();
    provider.setClient(mockSql);
    await provider.boot();

    const health = await provider.health();
    expect(health.status).toBe("healthy");

    const diags = await provider.diagnostics();
    expect(diags.enabled).toBe(true);
    expect(diags.hasClient).toBe(true);

    await provider.shutdown();
  });

  it("should fail gracefully on boot connection error", async () => {
    const provider = new PostgresqlProvider();
    const badSql = vi.fn().mockImplementation(() => Promise.reject(new Error("Connection timeout")));
    provider.setClient(badSql as any);
    
    await expect(provider.boot()).rejects.toThrow("Failed to verify injected database connection");
    expect(provider.enabled).toBe(false);
  });

  it("should report unhealthy status on query failure", async () => {
    const provider = new PostgresqlProvider();
    const badSql = vi.fn().mockImplementation(() => Promise.reject(new Error("Query failed")));
    provider.setClient(badSql as any);
    
    const health = await provider.health();
    expect(health.status).toBe("unhealthy");
    expect(health.reason).toBe("Query failed");
  });
});
