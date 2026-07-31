import type { Redis } from "ioredis";
import { v4 as uuidv4 } from "uuid";
import type { IQueueProvider, Job, JobHandler } from "../../core/queue/queue.interface.js";
import { logger } from "../../core/logger/logger.js";

export class RedisQueueProvider implements IQueueProvider {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly handlers = new Map<string, JobHandler<any>>();
  private readonly pausedQueues = new Set<string>();

  constructor(private readonly client: Redis) {}

  async createQueue(name: string): Promise<void> {
    await this.client.sadd("onbp:queues", name);
  }

  async deleteQueue(name: string): Promise<boolean> {
    await this.client.srem("onbp:queues", name);
    await this.client.del(`onbp:queue:${name}:pending`);
    this.pausedQueues.delete(name);
    return true;
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

    const serialized = JSON.stringify({
      id: job.id,
      name: job.name,
      data: job.data,
      attempts: job.attempts,
      maxRetries: job.maxRetries,
      status: job.status,
      createdAt: job.createdAt.toISOString(),
    });

    await this.client.hset("onbp:jobs", job.id, serialized);
    await this.client.rpush(`onbp:queue:${queue}:pending`, job.id);

    if (!this.pausedQueues.has(queue)) {
      setImmediate(() => this.runJob(job.id));
    }

    return job;
  }

  async dequeue(queue: string): Promise<Job | undefined> {
    const jobId = await this.client.lpop(`onbp:queue:${queue}:pending`);
    if (!jobId) return undefined;
    return this.getJob(jobId);
  }

  process<T>(queue: string, handler: JobHandler<T>): void {
    this.handlers.set(queue, handler);
  }

  async pause(queue: string): Promise<void> {
    this.pausedQueues.add(queue);
  }

  async resume(queue: string): Promise<void> {
    if (this.pausedQueues.delete(queue)) {
      const pendingIds = await this.client.lrange(`onbp:queue:${queue}:pending`, 0, -1);
      for (const id of pendingIds) {
        setImmediate(() => this.runJob(id));
      }
    }
  }

  async retry(jobId: string): Promise<boolean> {
    const job = await this.getJob(jobId);
    if (!job || job.status !== "failed") return false;

    job.status = "pending";
    job.attempts = 0;
    job.error = undefined;

    await this.updateJob(job);

    if (!this.pausedQueues.has(job.name)) {
      setImmediate(() => this.runJob(jobId));
    }

    return true;
  }

  async remove(jobId: string): Promise<boolean> {
    const job = await this.getJob(jobId);
    if (!job) return false;

    await this.client.lrem(`onbp:queue:${job.name}:pending`, 0, jobId);
    const deleted = await this.client.hdel("onbp:jobs", jobId);
    return deleted > 0;
  }

  async getJob(jobId: string): Promise<Job | undefined> {
    const raw = await this.client.hget("onbp:jobs", jobId);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw);
    return {
      ...parsed,
      createdAt: new Date(parsed.createdAt),
    };
  }

  async getQueueStats(queue: string): Promise<{ pending: number; processing: number; completed: number; failed: number }> {
    const stats = { pending: 0, processing: 0, completed: 0, failed: 0 };
    const allJobs = await this.client.hvals("onbp:jobs");
    for (const raw of allJobs) {
      const parsed = JSON.parse(raw);
      if (parsed.name === queue) {
        stats[parsed.status as keyof typeof stats]++;
      }
    }
    return stats;
  }

  private async updateJob(job: Job): Promise<void> {
    const serialized = JSON.stringify({
      id: job.id,
      name: job.name,
      data: job.data,
      attempts: job.attempts,
      maxRetries: job.maxRetries,
      status: job.status,
      error: job.error,
      createdAt: job.createdAt.toISOString(),
    });
    await this.client.hset("onbp:jobs", job.id, serialized);
  }

  private async runJob(id: string): Promise<void> {
    const job = await this.getJob(id);
    if (!job || job.status !== "pending") return;

    if (this.pausedQueues.has(job.name)) {
      return;
    }

    await this.client.lrem(`onbp:queue:${job.name}:pending`, 0, id);

    const handler = this.handlers.get(job.name);
    if (!handler) {
      logger.warn({ jobId: id, name: job.name }, "No handler registered for queue job");
      return;
    }

    job.status = "processing";
    job.attempts++;
    await this.updateJob(job);

    try {
      await handler(job);
      job.status = "completed";
      await this.updateJob(job);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      job.error = errMsg;

      if (job.attempts < job.maxRetries) {
        job.status = "pending";
        await this.updateJob(job);
        logger.warn({ jobId: id, attempts: job.attempts, error: errMsg }, "Job failed, scheduling retry");
        setTimeout(() => this.runJob(id), 1000 * job.attempts);
      } else {
        job.status = "failed";
        await this.updateJob(job);
        logger.error({ jobId: id, error: errMsg }, "Job permanently failed max retries");
      }
    }
  }
}
export default RedisQueueProvider;
