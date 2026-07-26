import { describe, it, expect, vi } from "vitest";
import { PluginManager } from "../../../apps/api/src/core/plugins/plugin.manager.js";
import type { IPlugin } from "../../../apps/api/src/core/plugins/plugin.interface.js";
import { container } from "../../../apps/api/src/core/container/container.js";
import { CORE_SERVICES } from "../../../apps/api/src/core/container/service.constants.js";

describe("Framework Integration - Plugin Loading", () => {
  it("should boot plugins in sorted order and register their providers", async () => {
    const manager = new PluginManager();
    const calls: string[] = [];

    // Register a stub ProviderManager
    const providerMgrMock = { register: vi.fn() };
    container.register(CORE_SERVICES.PROVIDER_MANAGER, providerMgrMock);

    const plugA: IPlugin = {
      name: "A",
      version: "1.0",
      dependencies: ["B"],
      register: () => { calls.push("registerA"); },
      boot: () => { calls.push("bootA"); },
    };

    const plugB: IPlugin = {
      name: "B",
      version: "1.0",
      dependencies: [],
      register: () => { calls.push("registerB"); },
      boot: () => { calls.push("bootB"); },
    };

    await manager.register(plugA);
    await manager.register(plugB);

    await manager.registerServices(container);
    await manager.boot();

    expect(calls).toEqual(["registerB", "registerA", "bootB", "bootA"]);

    // Cleanup mock
    const containerRef = container as Record<string, any>;
    containerRef.definitions.delete(CORE_SERVICES.PROVIDER_MANAGER);
    containerRef.singletons.delete(CORE_SERVICES.PROVIDER_MANAGER);
  });
});
