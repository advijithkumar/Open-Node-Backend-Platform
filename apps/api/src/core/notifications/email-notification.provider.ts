import type { INotificationProvider } from "./notification.interface.js";
import type { NotificationRequest, NotificationResult } from "./notification.types.js";
import { container } from "../container/container.js";
import { CORE_SERVICES } from "../container/service.constants.js";

export class EmailNotificationProvider implements INotificationProvider {
  readonly name = "email-notification-provider";
  readonly supportedChannels = ["email"];

  async send(request: NotificationRequest): Promise<NotificationResult> {
    const emailService = container.resolve<any>(CORE_SERVICES.EMAIL);
    const result = await emailService.send({
      to: request.recipient,
      subject: request.title,
      html: request.body, // default body payload to html
      metadata: request.metadata,
    });

    return {
      success: result.success,
      id: result.messageId,
      channel: "email",
      provider: this.name,
      error: result.error,
      timestamp: result.timestamp,
    };
  }

  async health() {
    const emailService = container.resolve<any>(CORE_SERVICES.EMAIL);
    return await emailService.getHealth();
  }

  async diagnostics() {
    const emailService = container.resolve<any>(CORE_SERVICES.EMAIL);
    return emailService.getDiagnostics();
  }
}
export default EmailNotificationProvider;
