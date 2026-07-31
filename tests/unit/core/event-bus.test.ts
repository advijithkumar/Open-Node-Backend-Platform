import { describe, it, expect, vi, beforeEach } from "vitest";
import { EventBus } from "../../../apps/api/src/core/events/event-bus.js";
import type { ONBPEvent } from "../../../apps/api/src/core/events/event.types.js";

describe("Platform Event System Unit Tests", () => {
  let eventBus: EventBus;

  beforeEach(() => {
    eventBus = new EventBus();
  });

  describe("Subscribing and Unsubscribing", () => {
    it("should register subscribers and trigger them on publish", async () => {
      const handler = vi.fn();
      eventBus.subscribe("test.event", handler);

      const event: ONBPEvent<string> = {
        id: "1",
        name: "test.event",
        source: "test",
        timestamp: new Date(),
        payload: "hello",
        version: "1.0",
      };

      await eventBus.publish(event);

      expect(handler).toHaveBeenCalledWith(event);
      
      const diags = eventBus.getDiagnostics();
      expect(diags.totalSubscribers).toBe(1);
      expect(diags.publishedCount).toBe(1);
    });

    it("should unsubscribe successfully", async () => {
      const handler = vi.fn();
      eventBus.subscribe("test.event", handler);
      eventBus.unsubscribe("test.event", handler);

      const event: ONBPEvent<string> = {
        id: "1",
        name: "test.event",
        source: "test",
        timestamp: new Date(),
        payload: "hello",
        version: "1.0",
      };

      await eventBus.publish(event);

      expect(handler).not.toHaveBeenCalled();
      const diags = eventBus.getDiagnostics();
      expect(diags.totalSubscribers).toBe(0);
    });

    it("should trigger once subscriptions exactly once", async () => {
      const handler = vi.fn();
      eventBus.once("test.event", handler);

      const event: ONBPEvent<string> = {
        id: "1",
        name: "test.event",
        source: "test",
        timestamp: new Date(),
        payload: "hello",
        version: "1.0",
      };

      await eventBus.publish(event);
      await eventBus.publish(event);

      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe("Event Execution insulation", () => {
    it("should not allow a failing handler to crash other handlers", async () => {
      const failingHandler = vi.fn().mockImplementation(() => {
        throw new Error("Deliberate failure");
      });
      const succeedingHandler = vi.fn();

      eventBus.subscribe("test.event", failingHandler);
      eventBus.subscribe("test.event", succeedingHandler);

      const event: ONBPEvent<string> = {
        id: "1",
        name: "test.event",
        source: "test",
        timestamp: new Date(),
        payload: "hello",
        version: "1.0",
      };

      await expect(eventBus.publish(event)).resolves.not.toThrow();

      expect(failingHandler).toHaveBeenCalled();
      expect(succeedingHandler).toHaveBeenCalled();

      const diags = eventBus.getDiagnostics();
      expect(diags.failureCount).toBe(1);
    });
  });

  describe("Predictable ordering (Priority)", () => {
    it("should execute handlers in order of highest priority first", async () => {
      const executionOrder: string[] = [];
      
      eventBus.on("test.event", () => {
        executionOrder.push("low");
      }, 0);

      eventBus.on("test.event", () => {
        executionOrder.push("high");
      }, 100);

      eventBus.on("test.event", () => {
        executionOrder.push("medium");
      }, 50);

      const event: ONBPEvent<string> = {
        id: "1",
        name: "test.event",
        source: "test",
        timestamp: new Date(),
        payload: "hello",
        version: "1.0",
      };

      await eventBus.publish(event);

      expect(executionOrder).toEqual(["high", "medium", "low"]);
    });
  });

  describe("Async publications", () => {
    it("should trigger async publication without waiting", async () => {
      const handler = vi.fn().mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
      });

      eventBus.subscribe("test.event", handler);

      const event: ONBPEvent<string> = {
        id: "1",
        name: "test.event",
        source: "test",
        timestamp: new Date(),
        payload: "hello",
        version: "1.0",
      };

      eventBus.publishAsync(event);
      expect(handler).toHaveBeenCalled();
    });
  });
});
