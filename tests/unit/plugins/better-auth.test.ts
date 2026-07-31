import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";
import { BetterAuthPlugin } from "../../../apps/api/src/plugins/better-auth/plugin.js";
import { BetterAuthProvider } from "../../../apps/api/src/plugins/better-auth/provider.js";
import { Container } from "../../../apps/api/src/core/container/index.js";
import { container as globalContainer } from "../../../apps/api/src/core/container/container.js";
import { CORE_SERVICES } from "../../../apps/api/src/core/container/service.constants.js";
import { BETTER_AUTH_CONSTANTS } from "../../../apps/api/src/plugins/better-auth/constants.js";

describe("Better Auth Plugin & Provider", () => {
  let mockAuth: any;

  beforeAll(() => {
    // Register mock config manager on the global container for config.ts resolution
    const mockConfigManager = {
      get: (key: string, defaultValue?: any) => {
        if (key === "plugins.better-auth.enabled") return true;
        if (key === "auth.secret") return "test-secret-key-mock";
        if (key === "auth.baseUrl") return "http://localhost:8080";
        return defaultValue;
      }
    };
    
    const definitions = (globalContainer as any).definitions;
    definitions.delete(CORE_SERVICES.CONFIG);
    
    globalContainer.registerSingleton(CORE_SERVICES.CONFIG, () => mockConfigManager);
  });

  beforeEach(() => {
    mockAuth = {
      handler: vi.fn().mockImplementation(() => {}),
    };
  });

  it("should have correct metadata and defaults", () => {
    const plugin = new BetterAuthPlugin();
    expect(plugin.name).toBe("better-auth");
    expect(plugin.version).toBe("1.0.0");
    expect(plugin.providers.length).toBe(1);

    const provider = plugin.providers[0];
    expect(provider.name).toBe("better-auth");
    expect(provider.type).toBe("auth");
  });

  it("should register client singleton into the container", async () => {
    const plugin = new BetterAuthPlugin();
    const container = new Container();

    await plugin.register(container);

    // Inject mock client and boot the provider
    const provider = plugin.providers[0] as BetterAuthProvider;
    provider.setClient(mockAuth);
    await provider.boot();

    const client = container.resolve<any>(BETTER_AUTH_CONSTANTS.CLIENT_KEY);
    expect(client).toBeDefined();
    expect(client.handler).toBeDefined();
  });

  it("should support health and diagnostics reporting", async () => {
    const provider = new BetterAuthProvider();
    provider.setClient(mockAuth);
    await provider.boot();

    const health = await provider.health();
    expect(health.status).toBe("healthy");

    const diags = await provider.diagnostics();
    expect(diags.enabled).toBe(true);
    expect(diags.hasClient).toBe(true);

    await provider.shutdown();
  });

  it("should fail gracefully on boot connection error", async () => {
    const provider = new BetterAuthProvider();
    const badAuth = {
      handler: undefined,
    };
    provider.setClient(badAuth as any);
    
    await expect(provider.boot()).rejects.toThrow("Failed to verify injected database connection");
    expect(provider.enabled).toBe(false);
  });

  it("should report unhealthy status on query failure", async () => {
    const provider = new BetterAuthProvider();
    const badAuth = {
      handler: undefined,
    };
    provider.setClient(badAuth as any);
    
    const health = await provider.health();
    expect(health.status).toBe("unhealthy");
  });
});
