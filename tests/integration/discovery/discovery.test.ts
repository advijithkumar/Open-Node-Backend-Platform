import { describe, it, expect } from "vitest";
import { DiscoveryService } from "../../../apps/api/src/core/discovery/discovery.service.js";
import { bootstrap } from "../../../apps/api/src/bootstrap/bootstrap.js";

describe("Framework Integration - Discovery", () => {
  it("should discover all core modules and services on boot", async () => {
    await bootstrap();
    const discovery = new DiscoveryService();

    const modules = discovery.discoverModules();
    expect(modules.length).toBeGreaterThan(0);
    expect(modules.map((m) => m.name)).toContain("users");

    const summary = await discovery.getSummary();
    expect(summary.modules).toBeGreaterThan(0);
    expect(summary.services).toBeGreaterThan(0);
  });
});
