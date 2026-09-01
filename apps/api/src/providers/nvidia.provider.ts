/* eslint-disable @typescript-eslint/no-explicit-any */
import type { IAIProvider } from "../core/ai/ai.interface.js";
import type {
  AICompletionOptions,
  AICompletionResult,
  AIEmbeddingResult,
} from "../core/ai/ai.types.js";

export interface NvidiaProviderConfig {
  apiKey?: string;
  model?: string;
  embeddingModel?: string;
  baseUrl?: string;
  fetchFn?: typeof fetch;
}

export class NvidiaProvider implements IAIProvider {
  readonly name = "nvidia";
  private readonly apiKey: string;
  private readonly defaultModel: string;
  private readonly defaultEmbeddingModel: string;
  private readonly baseUrl: string;
  private readonly fetch: typeof fetch;

  constructor(config: NvidiaProviderConfig = {}) {
    this.apiKey = config.apiKey !== undefined ? config.apiKey : (process.env.NVIDIA_API_KEY || "");
    this.defaultModel = config.model || "nvidia/nemotron-3-ultra-550b-a55b";
    this.defaultEmbeddingModel = config.embeddingModel || "nvidia/embed-qa-4";
    this.baseUrl = (config.baseUrl || "https://integrate.api.nvidia.com/v1").replace(/\/$/, "");
    this.fetch = config.fetchFn || globalThis.fetch;
  }

  async complete(prompt: string, options?: AICompletionOptions): Promise<AICompletionResult> {
    if (!prompt || prompt.trim() === "") {
      throw new Error("Prompt is required");
    }

    if (!this.apiKey) {
      throw new Error("NVIDIA API key is not configured.");
    }

    const model = options?.model || this.defaultModel;
    const temperature = options?.temperature ?? 0.7;
    const maxTokens = options?.maxTokens;
    const stream = options?.stream ?? false;

    let userContent: any = prompt;
    if (options?.imageUrl) {
      userContent = [
        { type: "text", text: prompt },
        { type: "image_url", image_url: { url: options.imageUrl } },
      ];
    }

    const body: Record<string, any> = {
      model,
      messages: [{ role: "user", content: userContent }],
      temperature,
    };

    if (maxTokens) {
      body.max_tokens = maxTokens;
    }

    if (options?.reasoningEffort) {
      body.reasoning_effort = options.reasoningEffort;
    }

    if (stream) {
      body.stream = true;
    }

    const timeoutMs = 60000;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    let response: Response;
    try {
      response = await this.fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
          Accept: stream ? "text/event-stream" : "application/json",
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
    } catch (err: any) {
      clearTimeout(timer);
      if (err.name === "AbortError") {
        throw new Error(
          `NVIDIA API connection timed out after ${timeoutMs / 1000}s. Check network connectivity or API key status.`,
          { cause: err }
        );
      }
      throw new Error(`NVIDIA API connection network error: ${err.message}`, { cause: err });
    } finally {
      clearTimeout(timer);
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`NVIDIA completion request failed (${response.status}): ${errorText}`);
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
      throw new Error("NVIDIA API key is not configured.");
    }

    const timeoutMs = 60000;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    let response: Response;
    try {
      response = await this.fetch(`${this.baseUrl}/embeddings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.defaultEmbeddingModel,
          input: text,
          input_type: "passage",
        }),
        signal: controller.signal,
      });
    } catch (err: any) {
      clearTimeout(timer);
      if (err.name === "AbortError") {
        throw new Error(`NVIDIA embedding request timed out after ${timeoutMs / 1000}s.`, {
          cause: err,
        });
      }
      throw new Error(`NVIDIA embedding network error: ${err.message}`, { cause: err });
    } finally {
      clearTimeout(timer);
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`NVIDIA embedding request failed (${response.status}): ${errorText}`);
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
      return { status: "unhealthy", reason: "NVIDIA API key is missing." };
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

export default NvidiaProvider;
