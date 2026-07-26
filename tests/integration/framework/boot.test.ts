import { describe, it, expect } from "vitest";
import { bootstrap } from "../../../apps/api/src/bootstrap/bootstrap.js";
import { container } from "../../../apps/api/src/core/container/index.js";
import { KERNEL_SERVICES, type Kernel } from "../../../apps/api/src/core/kernel/index.js";

describe("Framework Integration - Boot", () => {
  it("should successfully bootstrap the entire framework and boot modules", async () => {
    await bootstrap();

    const kernel = container.resolve<Kernel>(KERNEL_SERVICES.KERNEL);
    expect(kernel).toBeDefined();
    expect(kernel.lifecycle.getState()).toBe("READY");

    const modules = kernel.modules.getAll();
    expect(modules.length).toBeGreaterThan(0);

    // Verify UserModule is registered
    const userMod = kernel.modules.get("users");
    expect(userMod).toBeDefined();
  });
});
