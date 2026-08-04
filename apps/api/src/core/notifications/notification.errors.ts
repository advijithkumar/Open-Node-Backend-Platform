/* eslint-disable @typescript-eslint/no-explicit-any */

export class NotificationError extends Error {
  constructor(message: string, public readonly code: string, public readonly details?: any) {
    super(message);
    this.name = "NotificationError";
  }
}

export class UnsupportedChannelError extends NotificationError {
  constructor(channel: string) {
    super(`Notification channel '${channel}' is not supported.`, "UNSUPPORTED_CHANNEL", { channel });
  }
}

export class ProviderNotFoundError extends NotificationError {
  constructor(channel: string) {
    super(`No provider registered for notification channel '${channel}'.`, "PROVIDER_NOT_FOUND", { channel });
  }
}

export class ProviderDeliveryError extends NotificationError {
  constructor(provider: string, message: string, details?: any) {
    super(`Notification provider '${provider}' failed to deliver: ${message}`, "PROVIDER_DELIVERY_ERROR", { provider, details });
  }
}
