import { describe, it, expect } from "vitest";
import { LifecycleManager } from "../../../apps/api/src/core/lifecycle/lifecycle.manager.js";

describe("LifecycleManager Unit", () => {
  it("should get and set lifecycle state", () => {
    const manager = new LifecycleManager();
    expect(manager.getState()).toBe("CREATED");

    manager.setState("READY");
    expect(manager.is("READY")).toBe(true);
  });
});
