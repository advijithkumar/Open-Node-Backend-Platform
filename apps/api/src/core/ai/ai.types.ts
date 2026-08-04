/* eslint-disable @typescript-eslint/no-explicit-any */

export interface AICompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  stop?: string[];
}

export interface AICompletionResult {
  text: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  metadata?: Record<string, any>;
}

export interface AIEmbeddingResult {
  embedding: number[];
  model: string;
}
