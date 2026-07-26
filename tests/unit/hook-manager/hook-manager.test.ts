import { describe, it, expect } from "vitest";
import { HookManager } from "../../../apps/api/src/core/hooks/hook.manager.js";

describe("HookManager", () => {
  it("should register and execute hooks in sequence", async () => {
    const manager = new HookManager();
    const sequence: string[] = [];

    manager.registerBefore("test-hook", async (ctx) => {
      sequence.push("before1");
      (ctx as Record<string, any>).val += 1;
    });

    manager.registerBefore("test-hook", async (ctx) => {
      sequence.push("before2");
      (ctx as Record<string, any>).val += 2;
    });

    const ctx = { val: 10 };
    await manager.execute("test-hook", ctx);

    expect(sequence).toEqual(["before1", "before2"]);
    expect(ctx.val).toBe(13);
  });
});
