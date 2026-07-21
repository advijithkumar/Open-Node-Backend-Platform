import { describe, it, expect, beforeEach } from "vitest";
import { Container } from "./container/container.js";
import { EventBus } from "./events/event-bus.js";
import { HookManager } from "./hooks/hook.manager.js";

describe("Core Framework Foundation", () => {
  describe("Dependency Container", () => {
    let container: Container;

    beforeEach(() => {
      container = new Container();
    });

    it("should register and resolve singletons", () => {
      let count = 0;
      container.registerSingleton("counter", () => ++count);

      expect(container.resolve<number>("counter")).toBe(1);
      expect(container.resolve<number>("counter")).toBe(1);
    });

    it("should register and resolve transients", () => {
      let count = 0;
      container.registerTransient("counter", () => ++count);

      expect(container.resolve<number>("counter")).toBe(1);
      expect(container.resolve<number>("counter")).toBe(2);
    });
  });

  describe("Event Bus", () => {
    it("should trigger wildcard event handlers in priority order", async () => {
      const bus = new EventBus();
      const logs: string[] = [];

      bus.on("user.*", async () => {
        logs.push("wildcard");
      }, 5);

      bus.on("user.created", async () => {
        logs.push("exact");
      }, 10);

      await bus.emit("user.created", { id: "123" });
      expect(logs).toEqual(["exact", "wildcard"]);
    });
  });

  describe("Hook Manager", () => {
    it("should execute before, around, and after hooks", async () => {
      const hookManager = new HookManager();
      const executionOrder: string[] = [];

      hookManager.registerBefore("test", () => {
        executionOrder.push("before");
      });
      hookManager.registerAround("test", () => {
        executionOrder.push("around");
      });
      hookManager.registerAfter("test", () => {
        executionOrder.push("after");
      });

      await hookManager.execute("test", {});
      expect(executionOrder).toEqual(["before", "around", "after"]);
    });
  });
});
