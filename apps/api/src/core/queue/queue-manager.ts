import type { IQueueProvider, Job, JobHandler } from "./queue.interface.js";
import { MemoryQueueService } from "./memory-queue.service.js";
import { container } from "../container/container.js";
import { CORE_SERVICES } from "../container/service.constants.js";
import type { IEventBus } from "../events/event.interface.js";
import type { ILogger } from "../logger/logger.interface.js";

export class QueueManager implements IQueueProvider {
  private readonly providers = new Map<string, IQueueProvider>();
  private activeProviderName = "memory";

  // Registry of created queues
  private readonly createdQueues = new Set<string>();

  // Diagnostic counters
  private enqueuedJobs = 0;
  private completedJobs = 0;
  private failedJobs = 0;

  constructor() {
    // Register memory provider by default
    this.registerProvider("memory", new MemoryQueueService());
  }

  private getEventBus(): IEventBus | undefined {
    try {
      if (container.has(CORE_SERVICES.EVENT_BUS)) {
        return container.resolve<IEventBus>(CORE_SERVICES.EVENT_BUS);
      }
    } catch {
      // Fallback
    }
    return undefined;
  }

  private getLogger(): ILogger | undefined {
    try {
      if (container.has(CORE_SERVICES.LOGGER)) {
        return container.resolve<ILogger>(CORE_SERVICES.LOGGER);
      }
    } catch {
      // Fallback
    }
    return undefined;
  }

  private emitEventSafe(eventName: string, payload: any): void {
    const eventBus = this.getEventBus();
    if (eventBus) {
      Promise.resolve(eventBus.emit(eventName, payload)).catch((err) => {
        this.getLogger()?.error(`Failed to emit event ${eventName}`, err);
      });
    }
  }

  registerProvider(name: string, provider: IQueueProvider): void {
    this.providers.set(name, provider);
  }

  use(name: string): void {
    if (!this.providers.has(name)) {
      throw new Error(`Queue provider "${name}" is not registered`);
    }
    this.activeProviderName = name;
  }

  getActiveProvider(): IQueueProvider {
    return this.providers.get(this.activeProviderName) || this.providers.get("memory")!;
  }

  async createQueue(name: string): Promise<void> {
    await this.getActiveProvider().createQueue(name);
    this.createdQueues.add(name);
    this.emitEventSafe("queue.created", { queue: name });
  }

  async deleteQueue(name: string): Promise<boolean> {
    const deleted = await this.getActiveProvider().deleteQueue(name);
    if (deleted) {
      this.createdQueues.delete(name);
      this.emitEventSafe("queue.deleted", { queue: name });
    }
    return deleted;
  }

  async enqueue<T>(queue: string, data: T, maxRetries?: number): Promise<Job<T>> {
    const job = await this.getActiveProvider().enqueue(queue, data, maxRetries);
    this.enqueuedJobs++;
    this.emitEventSafe("job.enqueued", { jobId: job.id, queue, data });
    return job;
  }

  async dequeue(queue: string): Promise<Job | undefined> {
    return this.getActiveProvider().dequeue(queue);
  }

  process<T>(queue: string, handler: JobHandler<T>): void {
    const wrappedHandler: JobHandler<T> = async (job) => {
      this.emitEventSafe("job.started", { jobId: job.id, queue: job.name });
      try {
        await handler(job);
        this.completedJobs++;
        this.emitEventSafe("job.completed", { jobId: job.id, queue: job.name });
      } catch (err: any) {
        this.failedJobs++;
        this.emitEventSafe("job.failed", { jobId: job.id, queue: job.name, error: err.message || String(err) });
        throw err;
      }
    };
    this.getActiveProvider().process(queue, wrappedHandler);
  }

  async pause(queue: string): Promise<void> {
    await this.getActiveProvider().pause(queue);
  }

  async resume(queue: string): Promise<void> {
    await this.getActiveProvider().resume(queue);
  }

  async retry(jobId: string): Promise<boolean> {
    const retried = await this.getActiveProvider().retry(jobId);
    if (retried) {
      this.emitEventSafe("job.retried", { jobId });
    }
    return retried;
  }

  async remove(jobId: string): Promise<boolean> {
    return this.getActiveProvider().remove(jobId);
  }

  async getJob(jobId: string): Promise<Job | undefined> {
    return this.getActiveProvider().getJob(jobId);
  }

  async getQueueStats(queue: string): Promise<{ pending: number; processing: number; completed: number; failed: number }> {
    return this.getActiveProvider().getQueueStats(queue);
  }

  // Health checking
  async getHealth(): Promise<{ status: string; error?: string }> {
    try {
      const provider = this.getActiveProvider();
      await provider.createQueue("__health_check__");
      await provider.deleteQueue("__health_check__");
      return { status: "healthy" };
    } catch (err: any) {
      return { status: "unhealthy", error: err.message || String(err) };
    }
  }

  // Diagnostics reports
  getDiagnostics() {
    return {
      activeProvider: this.activeProviderName,
      registeredProviders: Array.from(this.providers.keys()),
      registeredQueues: Array.from(this.createdQueues),
      statistics: {
        enqueued: this.enqueuedJobs,
        completed: this.completedJobs,
        failed: this.failedJobs,
      },
    };
  }
}
export default QueueManager;
