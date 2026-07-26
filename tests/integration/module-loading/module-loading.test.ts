import { describe, it, expect, vi } from "vitest";
import { ModuleManager } from "../../../apps/api/src/core/modules/module.manager.js";
import type { IModule } from "../../../apps/api/src/core/modules/module.interface.js";
import type { Kernel } from "../../../apps/api/src/core/kernel/index.js";

describe("Framework Integration - Module Loading", () => {
  it("should load all registered modules in topological sorted dependency order", async () => {
    const manager = new ModuleManager();
    const calls: string[] = [];

    const modA: IModule = {
      name: "A",
      version: "1.0",
      dependencies: ["B"],
      register: () => { calls.push("registerA"); },
      boot: () => { calls.push("bootA"); },
    };

    const modB: IModule = {
      name: "B",
      version: "1.0",
      dependencies: [],
      register: () => { calls.push("registerB"); },
      boot: () => { calls.push("bootB"); },
    };

    manager.register(modA);
    manager.register(modB);

    const mockKernel = {
      logger: { info: vi.fn() }
    } as unknown as Kernel;

    await manager.loadAll(mockKernel);

    expect(calls).toEqual(["registerB", "registerA", "bootB", "bootA"]);
  });
});
