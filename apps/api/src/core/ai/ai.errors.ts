/* eslint-disable @typescript-eslint/no-explicit-any */

export class AIError extends Error {
  constructor(message: string, public readonly code: string, public readonly details?: any) {
    super(message);
    this.name = "AIError";
  }
}

export class AIValidationError extends AIError {
  constructor(message: string) {
    super(message, "AI_VALIDATION_ERROR");
  }
}

export class AIProviderNotFoundError extends AIError {
  constructor(providerName?: string) {
    super(providerName ? `AI provider '${providerName}' is not registered.` : "No AI provider registered.", "AI_PROVIDER_NOT_FOUND");
  }
}

export class AIDeliveryError extends AIError {
  constructor(provider: string, message: string, details?: any) {
    super(`AI provider '${provider}' failed request: ${message}`, "AI_DELIVERY_ERROR", { provider, details });
  }
}

export class AIUnsupportedOperationError extends AIError {
  constructor(operation: string, provider: string) {
    super(`Operation '${operation}' is not supported by AI provider '${provider}'.`, "AI_UNSUPPORTED_OPERATION", { operation, provider });
  }
}
