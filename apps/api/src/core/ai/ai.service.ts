import type { IAIService, AICompletionOptions } from "./ai.interface.js";
import { logger } from "../logger/logger.js";

export class AIService implements IAIService {
  constructor(private readonly apiKey?: string) {
    if (this.apiKey) {
      logger.info("AIService initialized with custom API key");
    }
  }

  async complete(prompt: string, options?: AICompletionOptions): Promise<string> {
    const model = options?.model || "default-ai-model";
    logger.info({ model, promptLength: prompt.length }, "Generating AI completion");
    return `[AI Response for: "${prompt.slice(0, 30)}..."]`;
  }

  async embed(text: string): Promise<number[]> {
    logger.info({ textLength: text.length }, "Generating text embeddings");
    return [0.01, 0.05, 0.12, 0.98];
  }
}
