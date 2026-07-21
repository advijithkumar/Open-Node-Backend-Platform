// src/core/events/event.errors.ts

export class EventError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EventError";
  }
}