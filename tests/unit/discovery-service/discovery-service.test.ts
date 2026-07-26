import { describe, it, expect } from "vitest";
import { DiscoveryService } from "../../../apps/api/src/core/discovery/discovery.service.js";
import { container } from "../../../apps/api/src/core/container/container.js";
import { CORE_SERVICES } from "../../../apps/api/src/core/container/service.constants.js";
import { MODULE_SERVICES } from "../../../apps/api/src/core/modules/module.constants.js";
import { PLUGIN_SERVICES } from "../../../apps/api/src/core/plugins/plugin.constants.js";

describe("DiscoveryService Unit", () => {
  it("should return empty results when registries are not configured", async () => {
    // Setup registries in container
    const mmMock = { getAll: () => [] };
    const pmMock = { getPlugins: () => [] };
    const provMock = { getDiagnostics: async () => [] };
    const routerMock = { registry: new Map() };

    container.register(MODULE_SERVICES.REGISTRY, mmMock);
    container.register(PLUGIN_SERVICES.REGISTRY, pmMock);
    container.register(CORE_SERVICES.PROVIDER_MANAGER, provMock);
    container.register(CORE_SERVICES.ROUTER, routerMock);

    const service = new DiscoveryService();
    expect(service.discoverModules()).toEqual([]);
    expect(service.discoverPlugins()).toEqual([]);
    expect(await service.discoverProviders()).toEqual([]);

    // Clean container definitions
    const containerRef = container as Record<string, any>;
    containerRef.definitions.delete(MODULE_SERVICES.REGISTRY);
    containerRef.definitions.delete(PLUGIN_SERVICES.REGISTRY);
    containerRef.definitions.delete(CORE_SERVICES.PROVIDER_MANAGER);
    containerRef.definitions.delete(CORE_SERVICES.ROUTER);
  });
});
