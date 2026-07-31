import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueueManager } from "../../../apps/api/src/core/queue/queue-manager.js";
import { MemoryQueueService } from "../../../apps/api/src/core/queue/memory-queue.service.js";
import { container } from "../../../apps/api/src/core/container/container.js";
import { CORE_SERVICES } from "../../../apps/api/src/core/container/service.constants.js";

describe("Queue Framework Unit Tests", () => {
  let queueManager: QueueManager;
  let eventBus: any;

  beforeEach(() => {
    vi.clearAllMocks();

    eventBus = {
      emit: vi.fn().mockResolvedValue(undefined),
    };

    // Clean container and register mocks
    const definitions = (container as any).definitions;
    definitions.delete(CORE_SERVICES.EVENT_BUS);
    const singletons = (container as any).singletons;
    singletons.delete(CORE_SERVICES.EVENT_BUS);

    container.registerSingleton(CORE_SERVICES.EVENT_BUS, () => eventBus);

    queueManager = new QueueManager();
  });

  describe("Queue Operations (Memory)", () => {
    it("should create and delete queues", async () => {
      await queueManager.createQueue("email-queue");
      expect(eventBus.emit).toHaveBeenCalledWith("queue.created", { queue: "email-queue" });

      const deleted = await queueManager.deleteQueue("email-queue");
      expect(deleted).toBe(true);
      expect(eventBus.emit).toHaveBeenCalledWith("queue.deleted", { queue: "email-queue" });
    });

    it("should enqueue and dequeue jobs", async () => {
      const job = await queueManager.enqueue("notifications", { to: "user@example.com" });
      expect(job.name).toBe("notifications");
      expect(job.status).toBe("pending");

      expect(eventBus.emit).toHaveBeenCalledWith("job.enqueued", {
        jobId: job.id,
        queue: "notifications",
        data: { to: "user@example.com" },
      });

      const popped = await queueManager.dequeue("notifications");
      expect(popped).toBeDefined();
      expect(popped!.id).toBe(job.id);
    });

    it("should process jobs with registered handlers", async () => {
      const handler = vi.fn().mockResolvedValue(undefined);
      queueManager.process("reports", handler);

      const job = await queueManager.enqueue("reports", { reportId: "123" });

      // Wait a moment for setImmediate execution
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(handler).toHaveBeenCalled();
      expect(eventBus.emit).toHaveBeenCalledWith("job.started", { jobId: job.id, queue: "reports" });
      expect(eventBus.emit).toHaveBeenCalledWith("job.completed", { jobId: job.id, queue: "reports" });
    });

    it("should handle job failures and retries", async () => {
      const handler = vi.fn().mockRejectedValue(new Error("Database offline"));
      queueManager.process("sync", handler);

      const job = await queueManager.enqueue("sync", { data: "test" }, 1);

      // Wait for attempts
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(eventBus.emit).toHaveBeenCalledWith("job.failed", {
        jobId: job.id,
        queue: "sync",
        error: "Database offline",
      });

      const updatedJob = await queueManager.getJob(job.id);
      expect(updatedJob!.status).toBe("failed");

      // Retry the job
      const retried = await queueManager.retry(job.id);
      expect(retried).toBe(true);
      expect(eventBus.emit).toHaveBeenCalledWith("job.retried", { jobId: job.id });
    });
  });

  describe("Provider Switching & Health", () => {
    it("should register and switch active providers", async () => {
      const customProvider = new MemoryQueueService();
      queueManager.registerProvider("custom", customProvider);
      
      queueManager.use("custom");
      expect(queueManager.getActiveProvider()).toBe(customProvider);
    });

    it("should verify health check", async () => {
      const health = await queueManager.getHealth();
      expect(health.status).toBe("healthy");
    });

    it("should report diagnostics", async () => {
      await queueManager.createQueue("jobs");
      await queueManager.enqueue("jobs", { data: 1 });

      const diags = queueManager.getDiagnostics();
      expect(diags.activeProvider).toBe("memory");
      expect(diags.registeredQueues).toContain("jobs");
      expect(diags.statistics.enqueued).toBe(1);
    });
  });
});
