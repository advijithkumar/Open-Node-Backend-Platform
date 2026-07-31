// src/core/events/event.types.ts

export type EventName = string;

export type EventHandler<T = unknown> = (payload: T) => void | Promise<void>;

export interface ONBPEvent<T = unknown> {
  id: string;
  name: string;
  source: string;
  timestamp: Date;
  payload: T;
  correlationId?: string;
  version: string;
}