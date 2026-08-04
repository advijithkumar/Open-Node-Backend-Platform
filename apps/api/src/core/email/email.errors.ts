/* eslint-disable @typescript-eslint/no-explicit-any */

export class EmailError extends Error {
  constructor(message: string, public readonly code: string, public readonly details?: any) {
    super(message);
    this.name = "EmailError";
  }
}

export class EmailValidationError extends EmailError {
  constructor(message: string) {
    super(message, "EMAIL_VALIDATION_ERROR");
  }
}

export class EmailProviderNotFoundError extends EmailError {
  constructor() {
    super("No email provider registered.", "EMAIL_PROVIDER_NOT_FOUND");
  }
}

export class EmailDeliveryError extends EmailError {
  constructor(provider: string, message: string, details?: any) {
    super(`Email provider '${provider}' failed to deliver: ${message}`, "EMAIL_DELIVERY_ERROR", { provider, details });
  }
}

export class EmailTemplateError extends EmailError {
  constructor(message: string) {
    super(message, "EMAIL_TEMPLATE_ERROR");
  }
}
