import { v4 as uuidv4 } from "uuid";
import type { IQueueService, Job, JobHandler } from "./queue.interface.js";
import { logger } from "../logger/logger.js";

export class MemoryQueueService implements IQueueService {
  private readonly jobs = new Map<string, Job>();
  private readonly handlers = new Map<string, JobHandler<any>>();

  async enqueue<T>(name: string, data: T, maxRetries = 3): Promise<Job<T>> {
    const job: Job<T> = {
      id: uuidv4(),
      name,
      data,
      attempts: 0,
      maxRetries,
      status: "pending",
      createdAt: new Date(),
    };

    this.jobs.set(job.id, job as Job);
    logger.info({ jobId: job.id, name }, "Enqueued background job");

    // Trigger async execution
    setImmediate(() => this.runJob(job.id));
    return job;
  }

  process<T>(name: string, handler: JobHandler<T>): void {
    this.handlers.set(name, handler);
  }

  async getJob(id: string): Promise<Job | undefined> {
    return this.jobs.get(id);
  }

  private async runJob(id: string): Promise<void> {
    const job = this.jobs.get(id);
    if (!job) return;

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
}
