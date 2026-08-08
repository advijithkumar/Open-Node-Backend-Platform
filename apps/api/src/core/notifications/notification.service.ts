/* eslint-disable @typescript-eslint/no-explicit-any */
import type { INotificationService, INotificationProvider } from "./notification.interface.js";
import type { NotificationRequest, NotificationResult } from "./notification.types.js";
import { ProviderNotFoundError, ProviderDeliveryError } from "./notification.errors.js";
import { NOTIFICATION_EVENTS } from "./notification.constants.js";
import { container } from "../container/container.js";
import { CORE_SERVICES } from "../container/service.constants.js";
import { logger } from "../logger/logger.js";

export class NotificationService implements INotificationService {
  private readonly providers = new Map<string, INotificationProvider>();
  private sentCount = 0;
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

  registerProvider(provider: INotificationProvider): void {
    if (this.providers.has(provider.name)) {
      throw new Error(`Notification provider '${provider.name}' is already registered.`);
    }
    this.providers.set(provider.name, provider);
    logger.info(`Notification provider registered: ${provider.name}`);
  }

  async send(request: NotificationRequest): Promise<NotificationResult> {
    const provider = Array.from(this.providers.values()).find((p) => 
      p.supportedChannels.includes(request.channel)
    );

    if (!provider) {
      this.failedCount++;
      const error = new ProviderNotFoundError(request.channel);
      this.triggerEvent(NOTIFICATION_EVENTS.FAILED, { request, error: error.message });
      throw error;
    }

    try {
      const result = await provider.send(request);
      if (result.success) {
        this.sentCount++;
        this.triggerEvent(NOTIFICATION_EVENTS.SENT, { request, result });
      } else {
        this.failedCount++;
        this.triggerEvent(NOTIFICATION_EVENTS.FAILED, { request, result });
      }
      return result;
    } catch (err: any) {
      this.failedCount++;
      const deliveryErr = new ProviderDeliveryError(provider.name, err.message, err);
      this.triggerEvent(NOTIFICATION_EVENTS.FAILED, { request, error: deliveryErr.message });
      throw deliveryErr;
    }
  }

  private triggerEvent(eventName: string, payload: any): void {
    const eventBus = this.getEventBus();
    if (eventBus) {
<<<<<<< HEAD
      Promise.resolve(eventBus.emit(eventName, payload)).catch((err) => logger.error(err, "Failed to emit background event"));
=======
      Promise.resolve(eventBus.emit(eventName, payload)).catch((err) => {
        logger.error(`Failed to emit event ${eventName}`, { error: err });
      });
>>>>>>> master
    }
  }

  async getHealth(): Promise<{ status: "healthy" | "unhealthy"; reason?: string }> {
    if (this.providers.size === 0) {
      return { status: "healthy", reason: "No notification providers registered." };
    }

    const unhealthy: string[] = [];
    for (const provider of this.providers.values()) {
      if (provider.health) {
        try {
          const health = await provider.health();
          if (health.status !== "healthy") {
            unhealthy.push(`${provider.name}: ${health.reason || "unhealthy"}`);
          }
        } catch (err: any) {
          unhealthy.push(`${provider.name}: ${err.message}`);
        }
      }
    }

    if (unhealthy.length > 0) {
      return {
        status: "unhealthy",
        reason: `Unhealthy providers: ${unhealthy.join("; ")}`,
      };
    }

    return { status: "healthy" };
  }

  getDiagnostics() {
    const channels = new Set<string>();
    for (const p of this.providers.values()) {
      for (const ch of p.supportedChannels) {
        channels.add(ch);
      }
    }

    return {
      registeredProviders: Array.from(this.providers.keys()),
      supportedChannels: Array.from(channels),
      statistics: {
        sent: this.sentCount,
        failed: this.failedCount,
      },
    };
  }
}
export default NotificationService;
