import type { EmailMessage, EmailResult } from "./email.types.js";

export interface IEmailProvider {
  readonly name: string;
  send(message: EmailMessage): Promise<EmailResult>;
  health(): Promise<{ status: "healthy" | "unhealthy"; reason?: string }>;
  diagnostics(): Promise<Record<string, any>>;
}

export interface IEmailService {
  registerProvider(provider: IEmailProvider): void;
  send(message: EmailMessage): Promise<EmailResult>;
  getHealth(): Promise<{ status: "healthy" | "unhealthy"; reason?: string }>;
  getDiagnostics(): {
    registeredProviders: string[];
    activeProvider: string | null;
    statistics: { sent: number; failed: number };
  };
}
