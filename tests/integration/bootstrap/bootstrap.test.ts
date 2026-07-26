import { describe, it, expect } from "vitest";
import { registerCore } from "../../../apps/api/src/bootstrap/register-core.js";
import { container } from "../../../apps/api/src/core/container/index.js";
import { CORE_SERVICES } from "../../../apps/api/src/core/container/service.constants.js";

describe("Framework Integration - Bootstrap", () => {
  it("should bind core services to the container", async () => {
    await registerCore();
    expect(container.has(CORE_SERVICES.CONFIG)).toBe(true);
    expect(container.has(CORE_SERVICES.PROVIDER_MANAGER)).toBe(true);
    expect(container.has(CORE_SERVICES.ROUTER)).toBe(true);
  });
});
