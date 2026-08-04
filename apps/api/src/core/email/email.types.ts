/* eslint-disable @typescript-eslint/no-explicit-any */

export interface EmailAttachment {
  filename: string;
  content: string | Buffer;
  contentType?: string;
}

export interface EmailMessage {
  from?: string;
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: EmailAttachment[];
  template?: string;
  templateData?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  provider: string;
  error?: string;
  timestamp: Date;
}
