import type { IEventBus } from "./event.interface.js";
import type { EventHandler, EventName, ONBPEvent } from "./event.types.js";
import { logger } from "../logger/logger.js";

export interface EventRegistration<T = unknown> {
  handler: EventHandler<T>;
  priority: number;
  once?: boolean;
}

export interface EventRecord<T = unknown> {
  event: EventName;
  payload: T;
  timestamp: string;
}

export class EventBus implements IEventBus {
  static emit(arg0: string, arg1: { jobId: string; queue: string; }): any {
    throw new Error("Method not implemented.");
  }
  private readonly listeners = new Map<string, EventRegistration<unknown>[]>();
  private readonly history: EventRecord[] = [];
  private readonly maxHistorySize = 100;

  // Diagnostics counters
  private publishedCount = 0;
  private asyncPublishedCount = 0;
  private failureCount = 0;

  on<T>(event: EventName, handler: EventHandler<T>, priority = 0): void {
    this.addListener(event, handler as EventHandler<unknown>, priority, false);
  }

  once<T>(event: EventName, handler: EventHandler<T>, priority = 0): void {
    this.addListener(event, handler as EventHandler<unknown>, priority, true);
  }

  off<T>(event: EventName, handler: EventHandler<T>): void {
    const regs = this.listeners.get(event);
    if (!regs) return;
    this.listeners.set(
      event,
      regs.filter((r) => r.handler !== handler)
    );
  }

  // Enhanced Platform Event System
  subscribe<T>(event: EventName, handler: EventHandler<T>): void {
    this.on(event, handler);
  }

  unsubscribe<T>(event: EventName, handler: EventHandler<T>): void {
    this.off(event, handler);
  }

  async publish<T>(event: ONBPEvent<T>): Promise<void> {
    this.publishedCount++;
    await this.emit(event.name, event);
  }

  publishAsync<T>(event: ONBPEvent<T>): void {
    this.asyncPublishedCount++;
    // Execute in the background without awaiting
    Promise.resolve(this.emit(event.name, event)).catch((err) => {
      this.failureCount++;
      logger.error(err, `[EventBus] Background emit failed for async event "${event.name}"`);
    });
  }

  private addListener(
    event: EventName,
    handler: EventHandler<unknown>,
    priority: number,
    once: boolean
  ): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    const regs = this.listeners.get(event)!;
    regs.push({ handler, priority, once });
    regs.sort((a, b) => b.priority - a.priority);
  }

  async emit<T>(event: EventName, payload: T): Promise<void> {
    this.recordHistory(event, payload);

    // Find direct and wildcard matches (e.g. "users.*", "*")
    const matchingEvents = Array.from(this.listeners.keys()).filter((pattern) =>
      this.matchPattern(pattern, event)
    );

    const handlersToExecute: { reg: EventRegistration<unknown>; pattern: string }[] = [];

    for (const pattern of matchingEvents) {
      const regs = this.listeners.get(pattern) || [];
      for (const reg of regs) {
        handlersToExecute.push({ reg, pattern });
      }
    }

    handlersToExecute.sort((a, b) => b.reg.priority - a.reg.priority);

    for (const { reg, pattern } of handlersToExecute) {
      try {
        const res = reg.handler(payload);
        if (res instanceof Promise) {
          await res;
        }
      } catch (err) {
        this.failureCount++;
        logger.error(err, `[EventBus] Handler failure for event "${event}"`);
      }
      if (reg.once) {
        this.off(pattern, reg.handler);
      }
    }
  }

  getHistory(): readonly EventRecord[] {
    return [...this.history];
  }

  clearHistory(): void {
    this.history.length = 0;
  }

  private matchPattern(pattern: string, event: string): boolean {
    if (pattern === "*" || pattern === event) return true;
    if (pattern.endsWith(".*")) {
      const prefix = pattern.slice(0, -2);
      return event.startsWith(prefix + ".");
    }
    return false;
  }

  private recordHistory<T>(event: EventName, payload: T): void {
    this.history.push({
      event,
      payload,
      timestamp: new Date().toISOString(),
    });
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }
  }

  // Diagnostics reports
  getDiagnostics() {
    let subscriberCount = 0;
    for (const regs of this.listeners.values()) {
      subscriberCount += regs.length;
    }

    return {
      totalEventsRegistered: this.listeners.size,
      totalSubscribers: subscriberCount,
      publishedCount: this.publishedCount,
      asyncPublishedCount: this.asyncPublishedCount,
      failureCount: this.failureCount,
    };
  }
}
export default EventBus;
