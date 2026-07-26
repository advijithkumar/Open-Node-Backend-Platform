import { describe, it, expect } from "vitest";
import { ModuleManager } from "../../../apps/api/src/core/modules/module.manager.js";
import type { IModule } from "../../../apps/api/src/core/modules/module.interface.js";

describe("ModuleManager", () => {
  it("should sort modules based on dependencies topologically", () => {
    const manager = new ModuleManager();
    const modA: IModule = { name: "A", version: "1.0", dependencies: ["B"] };
    const modB: IModule = { name: "B", version: "1.0", dependencies: [] };
    const modC: IModule = { name: "C", version: "1.0", dependencies: ["A"] };

    manager.register(modA);
    manager.register(modB);
    manager.register(modC);

    const sorted = manager.getTopologicallySortedModules();
    const names = sorted.map((m) => m.name);

    expect(names.indexOf("B")).toBeLessThan(names.indexOf("A"));
    expect(names.indexOf("A")).toBeLessThan(names.indexOf("C"));
  });

  it("should throw error when circular module dependency detected", () => {
    const manager = new ModuleManager();
    const modA: IModule = { name: "A", version: "1.0", dependencies: ["B"] };
    const modB: IModule = { name: "B", version: "1.0", dependencies: ["A"] };

    manager.register(modA);
    manager.register(modB);

    expect(() => manager.getTopologicallySortedModules()).toThrow(/Circular module dependency/);
  });
});
