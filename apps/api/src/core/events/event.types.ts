// src/core/events/event.types.ts

export type EventName = string;

export type EventHandler<T = unknown> = (payload: T) => void | Promise<void>;