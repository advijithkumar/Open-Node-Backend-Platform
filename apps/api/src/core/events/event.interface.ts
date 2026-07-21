// src/core/events/event.interface.ts

import type { EventHandler, EventName } from "./event.types.js";

export interface IEventBus {
  on<T>(event: EventName, handler: EventHandler<T>): void;

  once<T>(event: EventName, handler: EventHandler<T>): void;

  off<T>(event: EventName, handler: EventHandler<T>): void;

  emit<T>(event: EventName, payload: T): Promise<void>;
}