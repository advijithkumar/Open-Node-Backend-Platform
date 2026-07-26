import { describe, it, expect } from "vitest";
import { HealthManager } from "../../../apps/api/src/core/health/health.manager.js";

describe("HealthManager Unit", () => {
  it("should report basic status", async () => {
    const manager = new HealthManager();
    const result = await manager.runAll();
    expect(result).toBeDefined();
  });
});
