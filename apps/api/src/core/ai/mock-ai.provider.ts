import type { IAIProvider } from "./ai.interface.js";
import type { AICompletionOptions, AICompletionResult, AIEmbeddingResult } from "./ai.types.js";

export class MockAIProvider implements IAIProvider {
  readonly name = "mock";

  constructor(private readonly config: { model?: string; apiKey?: string } = {}) {}

  async complete(prompt: string, options?: AICompletionOptions): Promise<AICompletionResult> {
    if (!prompt) {
      throw new Error("Prompt is required");
    }
    const model = options?.model || this.config.model || "mock-model";
    return {
      text: `[Mock Completion Response for prompt: "${prompt}"]`,
      model,
      usage: {
        promptTokens: prompt.split(/\s+/).length,
        completionTokens: 10,
        totalTokens: prompt.split(/\s+/).length + 10,
      },
    };
  }

  async embed(text: string): Promise<AIEmbeddingResult> {
    if (!text) {
      throw new Error("Text is required");
    }
    return {
      embedding: [0.1, 0.2, 0.3, 0.4],
      model: this.config.model || "mock-embedding-model",
    };
  }

  async embedMany(texts: string[]): Promise<AIEmbeddingResult[]> {
    return Promise.all(texts.map((t) => this.embed(t)));
  }

  async health(): Promise<{ status: "healthy" | "unhealthy"; reason?: string }> {
    return { status: "healthy" };
  }

  async diagnostics(): Promise<Record<string, any>> {
    return {
      model: this.config.model || "mock-model",
      apiKeyConfigured: !!this.config.apiKey,
    };
  }
}
export default MockAIProvider;
