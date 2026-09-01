/* eslint-disable @typescript-eslint/no-explicit-any */
import type { IAIProvider } from "../core/ai/ai.interface.js";
import type { AICompletionOptions, AICompletionResult, AIEmbeddingResult } from "../core/ai/ai.types.js";

export interface OpenAIProviderConfig {
  apiKey?: string;
  model?: string;
  embeddingModel?: string;
  baseUrl?: string;
  fetchFn?: typeof fetch;
}

export class OpenAIProvider implements IAIProvider {
  readonly name = "openai";
  private readonly apiKey: string;
  private readonly defaultModel: string;
  private readonly defaultEmbeddingModel: string;
  private readonly baseUrl: string;
  private readonly fetch: typeof fetch;

  constructor(config: OpenAIProviderConfig = {}) {
    this.apiKey = config.apiKey || process.env.OPENAI_API_KEY || "";
    this.defaultModel = config.model || "gpt-4o-mini";
    this.defaultEmbeddingModel = config.embeddingModel || "text-embedding-3-small";
    this.baseUrl = (config.baseUrl || "https://api.openai.com/v1").replace(/\/$/, "");
    this.fetch = config.fetchFn || globalThis.fetch;
  }

  async complete(prompt: string, options?: AICompletionOptions): Promise<AICompletionResult> {
    if (!prompt || prompt.trim() === "") {
      throw new Error("Prompt is required");
    }

    if (!this.apiKey) {
      throw new Error("OpenAI API key is not configured.");
    }

    const model = options?.model || this.defaultModel;
    const temperature = options?.temperature ?? 0.7;
    const maxTokens = options?.maxTokens;

    const body: Record<string, any> = {
      model,
      messages: [{ role: "user", content: prompt }],
      temperature,
    };

    if (maxTokens) {
      body.max_tokens = maxTokens;
    }

    const response = await this.fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI completion request failed (${response.status}): ${errorText}`);
    }

    const data: any = await response.json();
    const choice = data.choices?.[0];
    const text = choice?.message?.content || "";

    return {
      text,
      model: data.model || model,
      usage: {
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0,
      },
    };
  }

  async embed(text: string): Promise<AIEmbeddingResult> {
    if (!text || text.trim() === "") {
      throw new Error("Text is required");
    }

    if (!this.apiKey) {
      throw new Error("OpenAI API key is not configured.");
    }

    const response = await this.fetch(`${this.baseUrl}/embeddings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.defaultEmbeddingModel,
        input: text,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI embedding request failed (${response.status}): ${errorText}`);
    }

    const data: any = await response.json();
    const embeddingData = data.data?.[0];

    return {
      embedding: embeddingData?.embedding || [],
      model: data.model || this.defaultEmbeddingModel,
    };
  }

  async embedMany(texts: string[]): Promise<AIEmbeddingResult[]> {
    return Promise.all(texts.map((t) => this.embed(t)));
  }

  async health(): Promise<{ status: "healthy" | "unhealthy"; reason?: string }> {
    if (!this.apiKey) {
      return { status: "unhealthy", reason: "OpenAI API key is missing." };
    }
    return { status: "healthy" };
  }

  async diagnostics(): Promise<Record<string, any>> {
    return {
      provider: this.name,
      model: this.defaultModel,
      embeddingModel: this.defaultEmbeddingModel,
      baseUrl: this.baseUrl,
      apiKeyConfigured: !!this.apiKey,
    };
  }
}

export default OpenAIProvider;
