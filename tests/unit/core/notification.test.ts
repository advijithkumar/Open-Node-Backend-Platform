import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NotificationService } from "../../../apps/api/src/core/notifications/notification.service.js";
import type { INotificationProvider } from "../../../apps/api/src/core/notifications/notification.interface.js";
import type { NotificationRequest } from "../../../apps/api/src/core/notifications/notification.types.js";
import { UnsupportedChannelError, ProviderNotFoundError, ProviderDeliveryError } from "../../../apps/api/src/core/notifications/notification.errors.js";
import { container } from "../../../apps/api/src/core/container/container.js";
import { CORE_SERVICES } from "../../../apps/api/src/core/container/service.constants.js";

describe("Notification Framework Unit Tests", () => {
  let notificationService: NotificationService;
  let mockEventBus: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockEventBus = {
      emit: vi.fn().mockResolvedValue(undefined),
    };

    const definitions = (container as any).definitions;
    definitions.clear();
    const singletons = (container as any).singletons;
    singletons.clear();

    container.registerSingleton(CORE_SERVICES.EVENT_BUS, () => mockEventBus);

    notificationService = new NotificationService();
  });

  afterEach(() => {
    const definitions = (container as any).definitions;
    definitions.clear();
    const singletons = (container as any).singletons;
    singletons.clear();
  });

  it("should support registering a provider and retrieving its diagnostics", async () => {
    const provider: INotificationProvider = {
      name: "sms-provider",
      supportedChannels: ["sms"],
      send: vi.fn().mockResolvedValue({ success: true, channel: "sms", provider: "sms-provider", timestamp: new Date() }),
      health: vi.fn().mockResolvedValue({ status: "healthy" }),
    };

    notificationService.registerProvider(provider);
    
    const diags = notificationService.getDiagnostics();
    expect(diags.registeredProviders).toContain("sms-provider");
    expect(diags.supportedChannels).toContain("sms");
    
    const health = await notificationService.getHealth();
    expect(health.status).toBe("healthy");
  });

  it("should throw an error if no provider matches the requested channel", async () => {
    const request: NotificationRequest = {
      recipient: "123456",
      channel: "sms",
      title: "Test",
      body: "Body",
    };

    await expect(notificationService.send(request)).rejects.toThrow(ProviderNotFoundError);
    expect(mockEventBus.emit).toHaveBeenCalledWith("notification.failed", expect.any(Object));
  });

  it("should route the request to the correct provider based on channel", async () => {
    const smsProvider: INotificationProvider = {
      name: "sms-provider",
      supportedChannels: ["sms"],
      send: vi.fn().mockResolvedValue({ success: true, id: "sms-123", channel: "sms", provider: "sms-provider", timestamp: new Date() }),
    };

    const pushProvider: INotificationProvider = {
      name: "push-provider",
      supportedChannels: ["push"],
      send: vi.fn().mockResolvedValue({ success: true, id: "push-123", channel: "push", provider: "push-provider", timestamp: new Date() }),
    };

    notificationService.registerProvider(smsProvider);
    notificationService.registerProvider(pushProvider);

    const smsRequest: NotificationRequest = { recipient: "1234", channel: "sms", title: "SMS", body: "Hello" };
    const pushRequest: NotificationRequest = { recipient: "token-1", channel: "push", title: "Push", body: "Hello" };

    const smsResult = await notificationService.send(smsRequest);
    expect(smsResult.id).toBe("sms-123");
    expect(smsProvider.send).toHaveBeenCalledWith(smsRequest);

    const pushResult = await notificationService.send(pushRequest);
    expect(pushResult.id).toBe("push-123");
    expect(pushProvider.send).toHaveBeenCalledWith(pushRequest);

    expect(mockEventBus.emit).toHaveBeenCalledWith("notification.sent", expect.any(Object));
    expect(notificationService.getDiagnostics().statistics.sent).toBe(2);
  });

  it("should wrap delivery exceptions in ProviderDeliveryError", async () => {
    const failingProvider: INotificationProvider = {
      name: "bad-provider",
      supportedChannels: ["email"],
      send: vi.fn().mockRejectedValue(new Error("SMTP Server Offline")),
    };

    notificationService.registerProvider(failingProvider);

    const request: NotificationRequest = {
      recipient: "user@example.com",
      channel: "email",
      title: "Email",
      body: "Body",
    };

    await expect(notificationService.send(request)).rejects.toThrow(ProviderDeliveryError);
    expect(mockEventBus.emit).toHaveBeenCalledWith("notification.failed", expect.any(Object));
    expect(notificationService.getDiagnostics().statistics.failed).toBe(1);
  });

  it("should report unhealthy if a provider health check fails", async () => {
    const unhealthyProvider: INotificationProvider = {
      name: "sms-provider",
      supportedChannels: ["sms"],
      send: vi.fn(),
      health: vi.fn().mockResolvedValue({ status: "unhealthy", reason: "API key expired" }),
    };

    notificationService.registerProvider(unhealthyProvider);

    const health = await notificationService.getHealth();
    expect(health.status).toBe("unhealthy");
    expect(health.reason).toContain("API key expired");
  });
});
