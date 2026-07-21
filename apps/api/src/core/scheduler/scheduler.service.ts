import { logger } from "../logger/logger.js";

export type ScheduledTaskHandler = () => Promise<void> | void;

export interface ScheduledTask {
  name: string;
  intervalMs: number;
  timerId?: NodeJS.Timeout;
}

export class SchedulerService {
  private readonly tasks = new Map<string, ScheduledTask>();

  scheduleInterval(name: string, intervalMs: number, handler: ScheduledTaskHandler): void {
    if (this.tasks.has(name)) {
      this.cancel(name);
    }

    const timerId = setInterval(async () => {
      try {
        await handler();
      } catch (err) {
        logger.error({ task: name, err }, "Scheduled task execution failed");
      }
    }, intervalMs);

    this.tasks.set(name, { name, intervalMs, timerId });
    logger.info({ name, intervalMs }, "Scheduled interval task");
  }

  cancel(name: string): boolean {
    const task = this.tasks.get(name);
    if (!task) return false;

    if (task.timerId) {
      clearInterval(task.timerId);
    }
    this.tasks.delete(name);
    return true;
  }

  stopAll(): void {
    for (const task of this.tasks.values()) {
      if (task.timerId) clearInterval(task.timerId);
    }
    this.tasks.clear();
  }
}
