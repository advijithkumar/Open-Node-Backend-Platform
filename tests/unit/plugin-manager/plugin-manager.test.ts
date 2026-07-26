import { describe, it, expect, vi } from "vitest";
import { PluginManager } from "../../../apps/api/src/core/plugins/plugin.manager.js";
import type { IPlugin } from "../../../apps/api/src/core/plugins/plugin.interface.js";
import { container } from "../../../apps/api/src/core/container/container.js";
import { CORE_SERVICES } from "../../../apps/api/src/core/container/service.constants.js";

describe("PluginManager", () => {
  it("should sort plugins based on dependencies topologically", async () => {
    const manager = new PluginManager();
    const plugA: IPlugin = { name: "A", version: "1.0", dependencies: ["B"] };
    const plugB: IPlugin = { name: "B", version: "1.0", dependencies: [] };

    // Register a stub ProviderManager to container
    const providerMgrMock = { register: vi.fn() };
    container.register(CORE_SERVICES.PROVIDER_MANAGER, providerMgrMock);

    await manager.register(plugA);
    await manager.register(plugB);

    const sorted = manager.getTopologicallySortedPlugins();
    const names = sorted.map((p) => p.name);

    expect(names.indexOf("B")).toBeLessThan(names.indexOf("A"));

    // Cleanup mock from container
    const containerRef = container as Record<string, any>;
    containerRef.definitions.delete(CORE_SERVICES.PROVIDER_MANAGER);
    containerRef.singletons.delete(CORE_SERVICES.PROVIDER_MANAGER);
  });

  it("should throw circular dependency error in PluginManager", async () => {
    const manager = new PluginManager();
    const plugA: IPlugin = { name: "A", version: "1.0", dependencies: ["B"] };
    const plugB: IPlugin = { name: "B", version: "1.0", dependencies: ["A"] };

    // Register a stub ProviderManager
    const providerMgrMock = { register: vi.fn() };
    container.register(CORE_SERVICES.PROVIDER_MANAGER, providerMgrMock);

    await manager.register(plugA);
    await manager.register(plugB);

    expect(() => manager.getTopologicallySortedPlugins()).toThrow(/Circular plugin dependency/);

    // Cleanup mock
    const containerRef = container as Record<string, any>;
    containerRef.definitions.delete(CORE_SERVICES.PROVIDER_MANAGER);
    containerRef.singletons.delete(CORE_SERVICES.PROVIDER_MANAGER);
  });
});
