/* eslint-disable @typescript-eslint/no-explicit-any */

export type NotificationChannel = "in-app" | "push" | "sms" | "email" | string;

export interface NotificationRequest<T = any> {
  recipient: string;
  channel: NotificationChannel;
  title: string;
  body: string;
  data?: T;
  metadata?: Record<string, any>;
  priority?: "low" | "normal" | "high";
}

export interface NotificationResult {
  success: boolean;
  id?: string;
  channel: NotificationChannel;
  provider: string;
  error?: string;
  timestamp: Date;
}
