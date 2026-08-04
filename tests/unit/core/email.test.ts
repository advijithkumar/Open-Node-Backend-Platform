import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { EmailService } from "../../../apps/api/src/core/email/email.service.js";
import { SmtpEmailProvider } from "../../../apps/api/src/core/email/smtp.provider.js";
import { NotificationService } from "../../../apps/api/src/core/notifications/notification.service.js";
import { EmailNotificationProvider } from "../../../apps/api/src/core/notifications/email-notification.provider.js";
import { EmailValidationError, EmailProviderNotFoundError, EmailDeliveryError, EmailTemplateError } from "../../../apps/api/src/core/email/email.errors.js";
import { container } from "../../../apps/api/src/core/container/container.js";
import { CORE_SERVICES } from "../../../apps/api/src/core/container/service.constants.js";

describe("Email Framework Unit & Integration Tests", () => {
  let emailService: EmailService;
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

    emailService = new EmailService();
    container.register(CORE_SERVICES.EMAIL, emailService);
  });

  afterEach(() => {
    const definitions = (container as any).definitions;
    definitions.clear();
    const singletons = (container as any).singletons;
    singletons.clear();
  });

  it("should validate required email properties correctly", async () => {
    // Missing to
    await expect(emailService.send({ to: "", subject: "Hi", text: "Yo" })).rejects.toThrow(EmailValidationError);
    // Invalid email format
    await expect(emailService.send({ to: "bad-email", subject: "Hi", text: "Yo" })).rejects.toThrow(EmailValidationError);
    // Missing subject
    await expect(emailService.send({ to: "user@example.com", subject: "", text: "Yo" })).rejects.toThrow(EmailValidationError);
    // Missing body
    await expect(emailService.send({ to: "user@example.com", subject: "Hi" })).rejects.toThrow(EmailValidationError);
  });

  it("should throw if no provider is registered", async () => {
    await expect(emailService.send({ to: "user@example.com", subject: "Hi", text: "Yo" })).rejects.toThrow(EmailProviderNotFoundError);
    expect(mockEventBus.emit).toHaveBeenCalledWith("email.failed", expect.any(Object));
  });

  it("should register SMTP provider, support health checks, and block credential leakage", async () => {
    const smtp = new SmtpEmailProvider({
      host: "localhost",
      port: 25,
      username: "user1",
      password: "secretpassword123",
      secure: false,
      from: "noreply@example.com",
    });

    emailService.registerProvider(smtp);

    const diags = await smtp.diagnostics();
    expect(diags.host).toBe("localhost");
    expect(diags.username).toBe("user1");
    // Ensure password is not exposed in diagnostics
    expect((diags as any).password).toBeUndefined();

    const health = await emailService.getHealth();
    expect(health.status).toBe("healthy");
  });

  it("should render template placeholder variables correctly", async () => {
    emailService.templates.register("welcome", "Hello {{ name }}! Your account is {{ status }}.");

    const smtp = new SmtpEmailProvider({ host: "mock", port: 25 });
    smtp.mockSendFn = vi.fn().mockResolvedValue({ success: true, provider: "smtp", timestamp: new Date() });
    emailService.registerProvider(smtp);

    await emailService.send({
      to: "user@example.com",
      subject: "Welcome!",
      template: "welcome",
      templateData: { name: "Alice", status: "active" },
    });

    expect(smtp.mockSendFn).toHaveBeenCalledWith(expect.objectContaining({
      text: "Hello Alice! Your account is active.",
    }));
  });

  it("should dispatch events to EventBus on successful sends", async () => {
    const smtp = new SmtpEmailProvider({ host: "mock", port: 25 });
    smtp.mockSendFn = vi.fn().mockResolvedValue({ success: true, messageId: "msg-123", provider: "smtp", timestamp: new Date() });
    emailService.registerProvider(smtp);

    const result = await emailService.send({
      to: "user@example.com",
      subject: "Welcome",
      text: "Hello world",
      cc: ["cc@example.com"],
      bcc: ["bcc@example.com"],
      replyTo: "reply@example.com",
    });

    expect(result.success).toBe(true);
    expect(mockEventBus.emit).toHaveBeenCalledWith("email.sent", expect.any(Object));
    expect(emailService.getDiagnostics().statistics.sent).toBe(1);
  });

  it("should emit failure event and throw on provider delivery exception", async () => {
    const smtp = new SmtpEmailProvider({ host: "mock", port: 25 });
    smtp.mockSendFn = vi.fn().mockRejectedValue(new Error("SMTP Timeout"));
    emailService.registerProvider(smtp);

    await expect(emailService.send({ to: "user@example.com", subject: "Hi", text: "Yo" })).rejects.toThrow(EmailDeliveryError);
    expect(mockEventBus.emit).toHaveBeenCalledWith("email.failed", expect.any(Object));
    expect(emailService.getDiagnostics().statistics.failed).toBe(1);
  });

  it("should integrate cleanly E2E with NotificationService email channel", async () => {
    // 1. Setup email service mock provider
    const smtp = new SmtpEmailProvider({ host: "mock", port: 25 });
    smtp.mockSendFn = vi.fn().mockResolvedValue({ success: true, messageId: "email-notif-123", provider: "smtp", timestamp: new Date() });
    emailService.registerProvider(smtp);

    // 2. Setup NotificationService
    const notificationService = new NotificationService();
    container.register(CORE_SERVICES.NOTIFICATION, notificationService);

    // 3. Register EmailNotificationProvider
    notificationService.registerProvider(new EmailNotificationProvider());

    // 4. Send notification over email channel
    const result = await notificationService.send({
      recipient: "customer@example.com",
      channel: "email",
      title: "Notification Subject",
      body: "Notification content body html",
    });

    expect(result.success).toBe(true);
    expect(result.id).toBe("email-notif-123");
    expect(smtp.mockSendFn).toHaveBeenCalledWith(expect.objectContaining({
      to: "customer@example.com",
      subject: "Notification Subject",
      html: "Notification content body html",
    }));
  });
});
