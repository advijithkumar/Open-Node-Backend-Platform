import type { NotificationRequest, NotificationResult, NotificationChannel } from "./notification.types.js";

export interface INotificationProvider {
  readonly name: string;
  readonly supportedChannels: NotificationChannel[];
  send(request: NotificationRequest): Promise<NotificationResult>;
  health?(): Promise<{ status: "healthy" | "unhealthy"; reason?: string }>;
  diagnostics?(): Promise<Record<string, any>>;
}

export interface INotificationService {
  registerProvider(provider: INotificationProvider): void;
  send(request: NotificationRequest): Promise<NotificationResult>;
  getHealth(): Promise<{ status: "healthy" | "unhealthy"; reason?: string }>;
  getDiagnostics(): {
    registeredProviders: string[];
    supportedChannels: string[];
    statistics: { sent: number; failed: number };
  };
}
