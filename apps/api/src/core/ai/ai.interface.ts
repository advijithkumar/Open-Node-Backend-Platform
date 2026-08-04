import type { AICompletionOptions, AICompletionResult, AIEmbeddingResult } from "./ai.types.js";

export interface IAIProvider {
  readonly name: string;
  complete(prompt: string, options?: AICompletionOptions): Promise<AICompletionResult>;
  embed(text: string): Promise<AIEmbeddingResult>;
  embedMany?(texts: string[]): Promise<AIEmbeddingResult[]>;
  health(): Promise<{ status: "healthy" | "unhealthy"; reason?: string }>;
  diagnostics(): Promise<Record<string, any>>;
}

export interface IAIService {
  registerProvider(provider: IAIProvider): void;
  setActiveProvider(name: string): void;
  getProvider(name: string): IAIProvider;
  complete(prompt: string, options?: AICompletionOptions): Promise<AICompletionResult>;
  embed(text: string): Promise<AIEmbeddingResult>;
  embedMany(texts: string[]): Promise<AIEmbeddingResult[]>;
  health(): Promise<{ status: "healthy" | "unhealthy"; reason?: string }>;
  getDiagnostics(): {
    registeredProviders: string[];
    activeProvider: string | null;
    statistics: { completionsCount: number; embeddingsCount: number; failedCount: number };
  };
}
