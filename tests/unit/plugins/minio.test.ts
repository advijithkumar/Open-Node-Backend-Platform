import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";
import { MinioPlugin } from "../../../apps/api/src/plugins/minio/plugin.js";
import { MinioProvider } from "../../../apps/api/src/plugins/minio/provider.js";
import { Container } from "../../../apps/api/src/core/container/index.js";
import { container as globalContainer } from "../../../apps/api/src/core/container/container.js";
import { CORE_SERVICES } from "../../../apps/api/src/core/container/service.constants.js";
import { MINIO_CONSTANTS } from "../../../apps/api/src/plugins/minio/constants.js";

describe("MinIO Plugin & Provider", () => {
  let mockMinio: any;

  beforeAll(() => {
    // Register mock config manager on the global container for config.ts resolution
    const mockConfigManager = {
      get: (key: string, defaultValue?: any) => {
        if (key === "plugins.minio.enabled") return true;
        if (key === "minio.endpoint") return "localhost";
        if (key === "minio.port") return 9000;
        return defaultValue;
      }
    };
    
    const definitions = (globalContainer as any).definitions;
    definitions.delete(CORE_SERVICES.CONFIG);
    
    globalContainer.registerSingleton(CORE_SERVICES.CONFIG, () => mockConfigManager);
  });

  beforeEach(() => {
    mockMinio = {
      listBuckets: vi.fn().mockResolvedValue([{ name: "test-bucket" }]),
    };
  });

  it("should have correct metadata and defaults", () => {
    const plugin = new MinioPlugin();
    expect(plugin.name).toBe("minio");
    expect(plugin.version).toBe("1.0.0");
    expect(plugin.providers.length).toBe(1);

    const provider = plugin.providers[0];
    expect(provider.name).toBe("minio");
    expect(provider.type).toBe("storage");
  });

  it("should register client singleton into the container", async () => {
    const plugin = new MinioPlugin();
    const container = new Container();

    await plugin.register(container);

    // Inject mock client and boot the provider
    const provider = plugin.providers[0] as MinioProvider;
    provider.setClient(mockMinio);
    await provider.boot();

    const client = container.resolve<any>(MINIO_CONSTANTS.CLIENT_KEY);
    expect(client).toBeDefined();
    await client.listBuckets();
    expect(mockMinio.listBuckets).toHaveBeenCalled();
  });

  it("should support health and diagnostics reporting", async () => {
    const provider = new MinioProvider();
    provider.setClient(mockMinio);
    await provider.boot();

    const health = await provider.health();
    expect(health.status).toBe("healthy");

    const diags = await provider.diagnostics();
    expect(diags.enabled).toBe(true);
    expect(diags.hasClient).toBe(true);

    await provider.shutdown();
  });

  it("should fail gracefully on boot connection error", async () => {
    const provider = new MinioProvider();
    const badMinio = {
      listBuckets: vi.fn().mockRejectedValue(new Error("MinIO connection timeout")),
    };
    provider.setClient(badMinio as any);
    
    await expect(provider.boot()).rejects.toThrow("Failed to verify injected database connection");
    expect(provider.enabled).toBe(false);
  });

  it("should report unhealthy status on query failure", async () => {
    const provider = new MinioProvider();
    const badMinio = {
      listBuckets: vi.fn().mockRejectedValue(new Error("MinIO disconnected")),
    };
    provider.setClient(badMinio as any);
    
    const health = await provider.health();
    expect(health.status).toBe("unhealthy");
    expect(health.reason).toBe("MinIO disconnected");
  });
});
