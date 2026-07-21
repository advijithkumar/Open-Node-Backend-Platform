import type { IEventBus } from "./event.interface.js";
import type { EventHandler, EventName } from "./event.types.js";

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
  private readonly listeners = new Map<string, EventRegistration<unknown>[]>();
  private readonly history: EventRecord[] = [];
  private readonly maxHistorySize = 100;

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
      await reg.handler(payload);
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
}
