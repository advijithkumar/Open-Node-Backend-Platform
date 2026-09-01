/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from "vitest";
import { AISessionMemoryManager } from "../../../apps/api/src/core/ai/ai-session-memory.js";

describe("AISessionMemoryManager Unit Tests", () => {
  it("should create session and accumulate formatted history", () => {
    const memory = new AISessionMemoryManager(5);
    memory.addMessage("sess-1", "user", "build a photo management server");
    memory.addMessage("sess-1", "assistant", "generated photo-management module");

    expect(memory.hasSession("sess-1")).toBe(true);
    const history = memory.getFormattedHistory("sess-1");
    expect(history).toContain("USER: build a photo management server");
    expect(history).toContain("ASSISTANT: generated photo-management module");
  });

  it("should automatically trim history when exceeding maxMessagesPerSession limit", () => {
    const memory = new AISessionMemoryManager(2);
    memory.addMessage("sess-2", "user", "msg1");
    memory.addMessage("sess-2", "assistant", "msg2");
    memory.addMessage("sess-2", "user", "msg3");

    const history = memory.getFormattedHistory("sess-2");
    expect(history).not.toContain("msg1");
    expect(history).toContain("msg2");
    expect(history).toContain("msg3");
  });

  it("should clear session context on clearSession", () => {
    const memory = new AISessionMemoryManager();
    memory.addMessage("sess-3", "user", "test");
    memory.clearSession("sess-3");
    expect(memory.hasSession("sess-3")).toBe(false);
  });
});
