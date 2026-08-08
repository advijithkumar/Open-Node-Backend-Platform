/* eslint-disable @typescript-eslint/no-explicit-any */
import type { IAIService, IAIProvider } from "./ai.interface.js";
import type { AICompletionOptions, AICompletionResult, AIEmbeddingResult } from "./ai.types.js";
import { AIValidationError, AIProviderNotFoundError, AIDeliveryError } from "./ai.errors.js";
import { AI_EVENTS } from "./ai.constants.js";
import { container } from "../container/container.js";
import { CORE_SERVICES } from "../container/service.constants.js";
import { logger } from "../logger/logger.js";

export class AIService implements IAIService {
  private readonly providers = new Map<string, IAIProvider>();
  private activeProviderName: string | null = null;
  private completionsCount = 0;
  private embeddingsCount = 0;
  private failedCount = 0;

  private getEventBus(): any {
    try {
      if (container.has(CORE_SERVICES.EVENT_BUS)) {
        return container.resolve(CORE_SERVICES.EVENT_BUS);
      }
    } catch {
      // Ignore resolution errors during testing/bootstrap
    }
    return undefined;
  }

  registerProvider(provider: IAIProvider): void {
    if (this.providers.has(provider.name)) {
      throw new Error(`AI provider '${provider.name}' is already registered.`);
    }
    this.providers.set(provider.name, provider);
    
    if (!this.activeProviderName) {
      this.activeProviderName = provider.name;
    }
    logger.info(`AI provider registered: ${provider.name}`);
  }

  setActiveProvider(name: string): void {
    if (!this.providers.has(name)) {
      throw new AIProviderNotFoundError(name);
    }
    this.activeProviderName = name;
  }

  getProvider(name: string): IAIProvider {
    const provider = this.providers.get(name);
    if (!provider) {
      throw new AIProviderNotFoundError(name);
    }
    return provider;
  }

  async complete(prompt: string, options?: AICompletionOptions): Promise<AICompletionResult> {
    if (!prompt || prompt.trim() === "") {
      throw new AIValidationError("Prompt must be a non-empty string.");
    }

    const provider = this.resolveActiveProvider();

    try {
      const result = await provider.complete(prompt, options);
      this.completionsCount++;
      this.triggerEvent(AI_EVENTS.COMPLETED, { prompt, result });
      return result;
    } catch (err: any) {
      this.failedCount++;
      const deliveryErr = new AIDeliveryError(provider.name, err.message, err);
      this.triggerEvent(AI_EVENTS.FAILED, { prompt, error: deliveryErr.message });
      throw deliveryErr;
    }
  }

  async embed(text: string): Promise<AIEmbeddingResult> {
    if (!text || text.trim() === "") {
      throw new AIValidationError("Text to embed must be a non-empty string.");
    }

    const provider = this.resolveActiveProvider();

    try {
      const result = await provider.embed(text);
      this.embeddingsCount++;
      this.triggerEvent(AI_EVENTS.EMBEDDED, { text, result });
      return result;
    } catch (err: any) {
      this.failedCount++;
      const deliveryErr = new AIDeliveryError(provider.name, err.message, err);
      this.triggerEvent(AI_EVENTS.FAILED, { text, error: deliveryErr.message });
      throw deliveryErr;
    }
  }

  async embedMany(texts: string[]): Promise<AIEmbeddingResult[]> {
    if (!texts || texts.length === 0) {
      throw new AIValidationError("Texts array must be non-empty.");
    }

    const provider = this.resolveActiveProvider();

    try {
      let results: AIEmbeddingResult[];
      if (provider.embedMany) {
        results = await provider.embedMany(texts);
      } else {
        results = await Promise.all(texts.map((t) => provider.embed(t)));
      }
      this.embeddingsCount += texts.length;
      this.triggerEvent(AI_EVENTS.EMBEDDED, { texts, results });
      return results;
    } catch (err: any) {
      this.failedCount += texts.length;
      const deliveryErr = new AIDeliveryError(provider.name, err.message, err);
      this.triggerEvent(AI_EVENTS.FAILED, { texts, error: deliveryErr.message });
      throw deliveryErr;
    }
  }

  private resolveActiveProvider(): IAIProvider {
    const name = this.activeProviderName;
    if (!name) {
      throw new AIProviderNotFoundError();
    }
    const provider = this.providers.get(name);
    if (!provider) {
      throw new AIProviderNotFoundError();
    }
    return provider;
  }

  private triggerEvent(eventName: string, payload: any): void {
    const eventBus = this.getEventBus();
    if (eventBus) {
      Promise.resolve(eventBus.emit(eventName, payload)).catch((err) => {
        logger.error(`Failed to emit event ${eventName}:`, err);
      });
    }
  }

  async health(): Promise<{ status: "healthy" | "unhealthy"; reason?: string }> {
    const name = this.activeProviderName;
    if (!name) {
      return { status: "healthy", reason: "No active AI provider registered." };
    }
    const provider = this.providers.get(name);
    if (!provider) {
      return { status: "unhealthy", reason: `Active provider '${name}' not found.` };
    }
    try {
      return await provider.health();
    } catch (err: any) {
      return { status: "unhealthy", reason: `Health check failed: ${err.message}` };
    }
  }

  getDiagnostics() {
    return {
      registeredProviders: Array.from(this.providers.keys()),
      activeProvider: this.activeProviderName,
      statistics: {
        completionsCount: this.completionsCount,
        embeddingsCount: this.embeddingsCount,
        failedCount: this.failedCount,
      },
    };
  }
}
export default AIService;
