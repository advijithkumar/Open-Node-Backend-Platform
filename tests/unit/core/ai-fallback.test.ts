/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from "vitest";
import { AIService } from "../../../apps/api/src/core/ai/ai.service.js";
import { MockAIProvider } from "../../../apps/api/src/core/ai/mock-ai.provider.js";

describe("AIService Provider Fallback Strategy Unit Tests", () => {
  it("should gracefully fall back to alternative provider when primary provider fails", async () => {
    const aiService = new AIService();

    const failingNvidiaProvider = {
      name: "nvidia",
      complete: vi.fn().mockRejectedValue(new Error("NVIDIA API key invalid or quota exceeded")),
      embed: vi.fn().mockRejectedValue(new Error("NVIDIA API key invalid")),
      health: vi.fn().mockResolvedValue({ status: "unhealthy", reason: "Invalid Key" }),
      diagnostics: vi.fn().mockResolvedValue({ provider: "nvidia" }),
    };

    const healthyMockProvider = new MockAIProvider({ model: "mock-model" });

    aiService.registerProvider(failingNvidiaProvider as any);
    aiService.registerProvider(healthyMockProvider);
    aiService.setActiveProvider("nvidia");

    // Complete should fall back to mock provider
    const res = await aiService.complete("Build a photo management server");
    expect(res.text).toContain("Mock Completion Response");
    expect(failingNvidiaProvider.complete).toHaveBeenCalled();
  });

  it("should throw AIDeliveryError if all registered providers fail", async () => {
    const aiService = new AIService();

    const provider1 = {
      name: "p1",
      complete: vi.fn().mockRejectedValue(new Error("P1 error")),
      embed: vi.fn().mockRejectedValue(new Error("P1 error")),
      health: vi.fn().mockResolvedValue({ status: "unhealthy" }),
      diagnostics: vi.fn().mockResolvedValue({}),
    };

    const provider2 = {
      name: "p2",
      complete: vi.fn().mockRejectedValue(new Error("P2 error")),
      embed: vi.fn().mockRejectedValue(new Error("P2 error")),
      health: vi.fn().mockResolvedValue({ status: "unhealthy" }),
      diagnostics: vi.fn().mockResolvedValue({}),
    };

    aiService.registerProvider(provider1 as any);
    aiService.registerProvider(provider2 as any);

    await expect(aiService.complete("Test")).rejects.toThrow("All AI providers failed");
  });
});
