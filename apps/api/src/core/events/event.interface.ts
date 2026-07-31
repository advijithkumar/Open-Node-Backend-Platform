import type { EventHandler, EventName, ONBPEvent } from "./event.types.js";

export interface IEventBus {
  // Legacy aliases
  on<T>(event: EventName, handler: EventHandler<T>): void;
  once<T>(event: EventName, handler: EventHandler<T>): void;
  off<T>(event: EventName, handler: EventHandler<T>): void;
  emit<T>(event: EventName, payload: T): Promise<void>;

  // Enhanced Platform Event System
  subscribe<T>(event: EventName, handler: EventHandler<T>): void;
  unsubscribe<T>(event: EventName, handler: EventHandler<T>): void;
  publish<T>(event: ONBPEvent<T>): Promise<void>;
  publishAsync<T>(event: ONBPEvent<T>): void;
}