import { v4 as uuidv4 } from "uuid";
import type { IQueueProvider, Job, JobHandler } from "./queue.interface.js";
import { logger } from "../logger/logger.js";

export class MemoryQueueService implements IQueueProvider {
  private readonly jobs = new Map<string, Job>();
  private readonly handlers = new Map<string, JobHandler<any>>();
  private readonly registeredQueues = new Set<string>();
  private readonly pausedQueues = new Set<string>();

  // Enqueued but not processed yet
  private readonly pendingJobs = new Map<string, string[]>();

  async createQueue(name: string): Promise<void> {
    this.registeredQueues.add(name);
    if (!this.pendingJobs.has(name)) {
      this.pendingJobs.set(name, []);
    }
  }

  async deleteQueue(name: string): Promise<boolean> {
    this.pausedQueues.delete(name);
    this.pendingJobs.delete(name);
    return this.registeredQueues.delete(name);
  }

  async enqueue<T>(queue: string, data: T, maxRetries = 3): Promise<Job<T>> {
    await this.createQueue(queue);

    const job: Job<T> = {
      id: uuidv4(),
      name: queue,
      data,
      attempts: 0,
      maxRetries,
      status: "pending",
      createdAt: new Date(),
    };

    this.jobs.set(job.id, job as Job);
    this.pendingJobs.get(queue)!.push(job.id);
    logger.info({ jobId: job.id, queue }, "Enqueued background job");

    // Trigger async execution if not paused
    if (!this.pausedQueues.has(queue)) {
      setImmediate(() => this.runJob(job.id));
    }

    return job;
  }

  async dequeue(queue: string): Promise<Job | undefined> {
    const list = this.pendingJobs.get(queue) || [];
    if (list.length === 0) return undefined;
    const jobId = list.shift()!;
    return this.jobs.get(jobId);
  }

  process<T>(queue: string, handler: JobHandler<T>): void {
    this.handlers.set(queue, handler);
  }

  async pause(queue: string): Promise<void> {
    this.pausedQueues.add(queue);
    logger.info({ queue }, "Queue paused");
  }

  async resume(queue: string): Promise<void> {
    if (this.pausedQueues.delete(queue)) {
      logger.info({ queue }, "Queue resumed");
      // Trigger execution for all pending jobs in this queue
      const list = this.pendingJobs.get(queue) || [];
      for (const jobId of list) {
        setImmediate(() => this.runJob(jobId));
      }
    }
  }

  async retry(jobId: string): Promise<boolean> {
    const job = this.jobs.get(jobId);
    if (!job || job.status !== "failed") return false;

    job.status = "pending";
    job.attempts = 0;
    job.error = undefined;

    if (!this.pausedQueues.has(job.name)) {
      setImmediate(() => this.runJob(jobId));
    }
    return true;
  }

  async remove(jobId: string): Promise<boolean> {
    const job = this.jobs.get(jobId);
    if (!job) return false;

    if (job.status === "pending") {
      const list = this.pendingJobs.get(job.name) || [];
      const index = list.indexOf(jobId);
      if (index !== -1) {
        list.splice(index, 1);
      }
    }

    return this.jobs.delete(jobId);
  }

  async getJob(id: string): Promise<Job | undefined> {
    return this.jobs.get(id);
  }

  async getQueueStats(queue: string): Promise<{ pending: number; processing: number; completed: number; failed: number }> {
    const stats = { pending: 0, processing: 0, completed: 0, failed: 0 };
    for (const job of this.jobs.values()) {
      if (job.name === queue) {
        stats[job.status]++;
      }
    }
    return stats;
  }

  private async runJob(id: string): Promise<void> {
    const job = this.jobs.get(id);
    if (!job || job.status !== "pending") return;

    if (this.pausedQueues.has(job.name)) {
      return;
    }

    // Remove from pending list
    const list = this.pendingJobs.get(job.name) || [];
    const index = list.indexOf(id);
    if (index !== -1) {
      list.splice(index, 1);
    }

    const handler = this.handlers.get(job.name);
    if (!handler) {
      logger.warn({ jobId: id, name: job.name }, "No handler registered for queue job");
      return;
    }

    job.status = "processing";
    job.attempts++;

    try {
      await handler(job);
      job.status = "completed";
      logger.info({ jobId: id, name: job.name }, "Completed queue job successfully");
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      job.error = errMsg;

      if (job.attempts < job.maxRetries) {
        job.status = "pending";
        logger.warn({ jobId: id, attempts: job.attempts, error: errMsg }, "Job failed, scheduling retry");
        setTimeout(() => this.runJob(id), 1000 * job.attempts);
      } else {
        job.status = "failed";
        logger.error({ jobId: id, error: errMsg }, "Job permanently failed max retries");
      }
    }
  }

  // Diagnostics helpers
  getRegisteredQueues(): string[] {
    return Array.from(this.registeredQueues);
  }
}
export default MemoryQueueService;
