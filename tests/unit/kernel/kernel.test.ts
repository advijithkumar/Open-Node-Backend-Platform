import { describe, it, expect, vi } from "vitest";
import { Kernel } from "../../../apps/api/src/core/kernel/kernel.js";
import { container } from "../../../apps/api/src/core/container/container.js";
import { CORE_SERVICES } from "../../../apps/api/src/core/container/service.constants.js";
import { ModuleManager } from "../../../apps/api/src/core/modules/module.manager.js";
import { PluginManager } from "../../../apps/api/src/core/plugins/plugin.manager.js";
import { EventBus } from "../../../apps/api/src/core/events/event-bus.js";
import { HookManager } from "../../../apps/api/src/core/hooks/hook.manager.js";
import { LifecycleManager } from "../../../apps/api/src/core/lifecycle/lifecycle.manager.js";

describe("Kernel Unit", () => {
  it("should instantiate with correct registries", () => {
    // Setup registries in container
    const mm = new ModuleManager();
    const pm = new PluginManager();
    const eb = new EventBus();
    const hm = new HookManager();
    const lm = new LifecycleManager();

    container.register(CORE_SERVICES.MODULES, mm);
    container.register(CORE_SERVICES.PLUGINS, pm);
    container.register(CORE_SERVICES.EVENT_BUS, eb);
    container.register(CORE_SERVICES.HOOKS, hm);
    container.register(CORE_SERVICES.LIFECYCLE, lm);

    const mockApp = {} as unknown as ConstructorParameters<typeof Kernel>[0];
    const mockLogger = { info: vi.fn() } as unknown as ConstructorParameters<typeof Kernel>[7];

    const kernel = new Kernel(mockApp, container, eb, hm, lm, mm, pm, mockLogger);
    expect(kernel.modules).toBe(mm);
    expect(kernel.plugins).toBe(pm);
    expect(kernel.events).toBe(eb);
    expect(kernel.hooks).toBe(hm);
    expect(kernel.lifecycle).toBe(lm);

    // Clean container definitions
    const containerRef = container as unknown as { definitions: Map<string, unknown> };
    containerRef.definitions.delete(CORE_SERVICES.MODULES);
    containerRef.definitions.delete(CORE_SERVICES.PLUGINS);
    containerRef.definitions.delete(CORE_SERVICES.EVENT_BUS);
    containerRef.definitions.delete(CORE_SERVICES.HOOKS);
    containerRef.definitions.delete(CORE_SERVICES.LIFECYCLE);
  });
});
