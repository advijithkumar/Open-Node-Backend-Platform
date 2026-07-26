import { describe, it, expect } from "vitest";
import { RouterManager } from "../../../apps/api/src/core/router/router.manager.js";

describe("RouterManager Unit", () => {
  it("should register prefixes and routers", () => {
    const routerMgr = new RouterManager();
    const mockRouter = { stack: [] } as unknown as Parameters<RouterManager["register"]>[0]["router"];

    routerMgr.register({ prefix: "/test", router: mockRouter });
    expect(routerMgr.has("/test")).toBe(true);
    expect(routerMgr.get("/test")).toBeDefined();
  });
});
