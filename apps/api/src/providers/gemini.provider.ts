/* eslint-disable @typescript-eslint/no-explicit-any */
import type { IAIProvider } from "../core/ai/ai.interface.js";
import type { AICompletionOptions, AICompletionResult, AIEmbeddingResult } from "../core/ai/ai.types.js";

export interface GeminiProviderConfig {
  apiKey?: string;
  model?: string;
  embeddingModel?: string;
  baseUrl?: string;
  fetchFn?: typeof fetch;
}

export class GeminiProvider implements IAIProvider {
  readonly name = "gemini";
  private readonly apiKey: string;
  private readonly defaultModel: string;
  private readonly defaultEmbeddingModel: string;
  private readonly baseUrl: string;
  private readonly fetch: typeof fetch;

  constructor(config: GeminiProviderConfig = {}) {
    this.apiKey = config.apiKey || process.env.GEMINI_API_KEY || "";
    this.defaultModel = config.model || "gemini-1.5-flash";
    this.defaultEmbeddingModel = config.embeddingModel || "text-embedding-004";
    this.baseUrl = (config.baseUrl || "https://generativelanguage.googleapis.com/v1beta").replace(/\/$/, "");
    this.fetch = config.fetchFn || globalThis.fetch;
  }

  async complete(prompt: string, options?: AICompletionOptions): Promise<AICompletionResult> {
    if (!prompt || prompt.trim() === "") {
      throw new Error("Prompt is required");
    }

    if (!this.apiKey) {
      throw new Error("Gemini API key is not configured.");
    }

    const model = options?.model || this.defaultModel;
    const temperature = options?.temperature ?? 0.7;

    const body: Record<string, any> = {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature,
      },
    };

    if (options?.maxTokens) {
      body.generationConfig.maxOutputTokens = options.maxTokens;
    }

    const url = `${this.baseUrl}/models/${model}:generateContent?key=${this.apiKey}`;
    const response = await this.fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini completion request failed (${response.status}): ${errorText}`);
    }

    const data: any = await response.json();
    const candidate = data.candidates?.[0];
    const text = candidate?.content?.parts?.[0]?.text || "";
    const totalTokens = data.usageMetadata?.totalTokenCount || prompt.split(/\s+/).length + 20;

    return {
      text,
      model,
      usage: {
        promptTokens: data.usageMetadata?.promptTokenCount || prompt.split(/\s+/).length,
        completionTokens: data.usageMetadata?.candidatesTokenCount || 20,
        totalTokens,
      },
    };
  }

  async embed(text: string): Promise<AIEmbeddingResult> {
    if (!text || text.trim() === "") {
      throw new Error("Text is required");
    }

    if (!this.apiKey) {
      throw new Error("Gemini API key is not configured.");
    }

    const url = `${this.baseUrl}/models/${this.defaultEmbeddingModel}:embedContent?key=${this.apiKey}`;
    const response = await this.fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: {
          parts: [{ text }],
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini embedding request failed (${response.status}): ${errorText}`);
    }

    const data: any = await response.json();

    return {
      embedding: data.embedding?.values || [],
      model: this.defaultEmbeddingModel,
    };
  }

  async embedMany(texts: string[]): Promise<AIEmbeddingResult[]> {
    return Promise.all(texts.map((t) => this.embed(t)));
  }

  async health(): Promise<{ status: "healthy" | "unhealthy"; reason?: string }> {
    if (!this.apiKey) {
      return { status: "unhealthy", reason: "Gemini API key is missing." };
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

export default GeminiProvider;
