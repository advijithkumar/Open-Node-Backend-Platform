/* eslint-disable @typescript-eslint/no-explicit-any */
import type { IEmailService, IEmailProvider } from "./email.interface.js";
import type { EmailMessage, EmailResult } from "./email.types.js";
import { EmailValidationError, EmailProviderNotFoundError, EmailDeliveryError } from "./email.errors.js";
import { EMAIL_EVENTS } from "./email.constants.js";
import { EmailTemplateRenderer } from "./email.template.js";
import { container } from "../container/container.js";
import { CORE_SERVICES } from "../container/service.constants.js";
import { logger } from "../logger/logger.js";

export class EmailService implements IEmailService {
  private readonly providers = new Map<string, IEmailProvider>();
  public readonly templates = new EmailTemplateRenderer();
  private activeProviderName: string | null = null;
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

  registerProvider(provider: IEmailProvider): void {
    if (this.providers.has(provider.name)) {
      throw new Error(`Email provider '${provider.name}' is already registered.`);
    }
    this.providers.set(provider.name, provider);

    // Automatically set the first registered provider as active
    if (!this.activeProviderName) {
      this.activeProviderName = provider.name;
    }
    logger.info(`Email provider registered: ${provider.name}`);
  }

  setActiveProvider(name: string): void {
    if (!this.providers.has(name)) {
      throw new Error(`Email provider '${name}' is not registered.`);
    }
    this.activeProviderName = name;
  }

  async send(message: EmailMessage): Promise<EmailResult> {
    // 1. Validate fields
    this.validateMessage(message);

    // 2. Resolve provider
    const providerName = this.activeProviderName;
    if (!providerName) {
      this.failedCount++;
      const error = new EmailProviderNotFoundError();
      this.triggerEvent(EMAIL_EVENTS.FAILED, { message, error: error.message });
      throw error;
    }

    const provider = this.providers.get(providerName);
    if (!provider) {
      this.failedCount++;
      const error = new EmailProviderNotFoundError();
      this.triggerEvent(EMAIL_EVENTS.FAILED, { message, error: error.message });
      throw error;
    }

    // 3. Compile template if specified
    const finalMessage = { ...message };
    if (message.template) {
      try {
        const rendered = this.templates.render(message.template, message.templateData || {});
        // If the rendered content looks like HTML, assign it to html, otherwise text
        if (rendered.trim().startsWith("<")) {
          finalMessage.html = rendered;
        } else {
          finalMessage.text = rendered;
        }
      } catch (err: any) {
        this.failedCount++;
        this.triggerEvent(EMAIL_EVENTS.FAILED, { message, error: err.message });
        throw err;
      }
    }

    // 4. Send email
    try {
      const result = await provider.send(finalMessage);
      if (result.success) {
        this.sentCount++;
        this.triggerEvent(EMAIL_EVENTS.SENT, { message: finalMessage, result });
      } else {
        this.failedCount++;
        this.triggerEvent(EMAIL_EVENTS.FAILED, { message: finalMessage, result });
      }
      return result;
    } catch (err: any) {
      this.failedCount++;
      const deliveryErr = new EmailDeliveryError(provider.name, err.message, err);
      this.triggerEvent(EMAIL_EVENTS.FAILED, { message: finalMessage, error: deliveryErr.message });
      throw deliveryErr;
    }
  }

  private validateMessage(message: EmailMessage): void {
    if (!message.to || (Array.isArray(message.to) && message.to.length === 0)) {
      throw new EmailValidationError("Recipient address 'to' is required.");
    }
    if (!message.subject) {
      throw new EmailValidationError("Email subject is required.");
    }
    if (!message.text && !message.html && !message.template) {
      throw new EmailValidationError("Email body content (text, html, or template) is required.");
    }

    // Basic email format check
    const validateEmailFormat = (email: string) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new EmailValidationError(`Invalid email address format: '${email}'`);
      }
    };

    if (Array.isArray(message.to)) {
      message.to.forEach(validateEmailFormat);
    } else {
      validateEmailFormat(message.to);
    }
  }

  private triggerEvent(eventName: string, payload: any): void {
    const eventBus = this.getEventBus();
    if (eventBus) {
      Promise.resolve(eventBus.emit(eventName, payload)).catch(() => {});
    }
  }

  async getHealth(): Promise<{ status: "healthy" | "unhealthy"; reason?: string }> {
    const providerName = this.activeProviderName;
    if (!providerName) {
      return { status: "healthy", reason: "No active email provider is registered." };
    }

    const provider = this.providers.get(providerName);
    if (!provider) {
      return { status: "unhealthy", reason: `Active provider '${providerName}' not found.` };
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
        sent: this.sentCount,
        failed: this.failedCount,
      },
    };
  }
}
export default EmailService;
