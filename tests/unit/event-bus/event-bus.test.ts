import { describe, it, expect, vi } from "vitest";
import { EventBus } from "../../../apps/api/src/core/events/event-bus.js";

describe("EventBus", () => {
  it("should register listeners and emit event payloads", async () => {
    const bus = new EventBus();
    const spy = vi.fn();

    bus.on("test.event", spy);
    await bus.emit("test.event", { data: "hello" });

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith({ data: "hello" });
  });

  it("should support off to remove listeners", async () => {
    const bus = new EventBus();
    const spy = vi.fn();

    bus.on("test.event", spy);
    bus.off("test.event", spy);
    await bus.emit("test.event", { data: "hello" });

    expect(spy).not.toHaveBeenCalled();
  });
});
