import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { AIService } from "../../../apps/api/src/core/ai/ai.service.js";
import { MockAIProvider } from "../../../apps/api/src/core/ai/mock-ai.provider.js";
import { AIValidationError, AIProviderNotFoundError, AIDeliveryError } from "../../../apps/api/src/core/ai/ai.errors.js";
import { container } from "../../../apps/api/src/core/container/container.js";
import { CORE_SERVICES } from "../../../apps/api/src/core/container/service.constants.js";

describe("AI Framework Unit Tests", () => {
  let aiService: AIService;
  let mockEventBus: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockEventBus = {
      emit: vi.fn().mockResolvedValue(undefined),
    };

    const definitions = (container as any).definitions;
    definitions.clear();
    const singletons = (container as any).singletons;
    singletons.clear();

    container.registerSingleton(CORE_SERVICES.EVENT_BUS, () => mockEventBus);

    aiService = new AIService();
    container.register(CORE_SERVICES.AI, aiService);
  });

  afterEach(() => {
    const definitions = (container as any).definitions;
    definitions.clear();
    const singletons = (container as any).singletons;
    singletons.clear();
  });

  it("should support provider registration, active provider selection, and retrieve diagnostics", async () => {
    const mockProvider = new MockAIProvider({ model: "gemini-flash" });
    aiService.registerProvider(mockProvider);

    const diags = aiService.getDiagnostics();
    expect(diags.registeredProviders).toContain("mock");
    expect(diags.activeProvider).toBe("mock");

    const health = await aiService.health();
    expect(health.status).toBe("healthy");
  });

  it("should throw AIValidationError on invalid empty prompt completions", async () => {
    const mockProvider = new MockAIProvider();
    aiService.registerProvider(mockProvider);

    await expect(aiService.complete("")).rejects.toThrow(AIValidationError);
    await expect(aiService.complete("   ")).rejects.toThrow(AIValidationError);
  });

  it("should throw AIProviderNotFoundError if no active provider is selected", async () => {
    await expect(aiService.complete("Hello")).rejects.toThrow(AIProviderNotFoundError);
  });

  it("should generate mock text completion and dispatch completed event", async () => {
    const mockProvider = new MockAIProvider({ model: "mock-model" });
    aiService.registerProvider(mockProvider);

    const result = await aiService.complete("Hello assistant", { temperature: 0.5 });
    expect(result.text).toContain("Hello assistant");
    expect(result.model).toBe("mock-model");
    expect(mockEventBus.emit).toHaveBeenCalledWith("ai.completed", expect.any(Object));

    expect(aiService.getDiagnostics().statistics.completionsCount).toBe(1);
  });

  it("should generate mock embeddings and dispatch embedded event", async () => {
    const mockProvider = new MockAIProvider({ model: "mock-embed" });
    aiService.registerProvider(mockProvider);

    const res = await aiService.embed("Text to convert");
    expect(res.embedding).toEqual([0.1, 0.2, 0.3, 0.4]);
    expect(res.model).toBe("mock-embed");

    const resMany = await aiService.embedMany(["text1", "text2"]);
    expect(resMany.length).toBe(2);
    expect(resMany[0].embedding).toEqual([0.1, 0.2, 0.3, 0.4]);

    expect(mockEventBus.emit).toHaveBeenCalledWith("ai.embedded", expect.any(Object));
    expect(aiService.getDiagnostics().statistics.embeddingsCount).toBe(3);
  });

  it("should wrap provider exception into AIDeliveryError and dispatch failed event", async () => {
    const mockProvider = new MockAIProvider();
    mockProvider.complete = vi.fn().mockRejectedValue(new Error("API Rate Limit Exceeded"));
    aiService.registerProvider(mockProvider);

    await expect(aiService.complete("Hello")).rejects.toThrow(AIDeliveryError);
    expect(mockEventBus.emit).toHaveBeenCalledWith("ai.failed", expect.any(Object));
    expect(aiService.getDiagnostics().statistics.failedCount).toBe(1);
  });
});
