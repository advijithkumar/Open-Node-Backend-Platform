import { describe, it, expect } from "vitest";
import { StorageService, LocalStorageProvider } from "./storage/index.js";
import { CacheService, MemoryCacheProvider } from "./cache/index.js";
import { MemoryQueueService } from "./queue/index.js";
import { SchedulerService } from "./scheduler/index.js";
import { AIService } from "./ai/index.js";

describe("Phase 2 Enterprise Platform Services", () => {
  describe("Storage Service", () => {
    it("should upload and retrieve file URL via provider", async () => {
      const storage = new StorageService(new LocalStorageProvider("./test-uploads"));
      const result = await storage.upload("test.txt", "Hello ONBP");

      expect(result.url).toBe("/uploads/test.txt");
      expect(await storage.exists("test.txt")).toBe(true);

      await storage.delete("test.txt");
    });
  });

  describe("Cache Service", () => {
    it("should handle get/set and remember fallback", async () => {
      const cache = new CacheService(new MemoryCacheProvider());
      await cache.set("key", "value", 10);

      expect(await cache.get("key")).toBe("value");

      const remembered = await cache.remember("computed", 10, async () => "result");
      expect(remembered).toBe("result");
    });
  });

  describe("Queue System", () => {
    it("should enqueue and process jobs", async () => {
      const queue = new MemoryQueueService();
      let processedData = "";

      queue.process<string>("email.send", async (job) => {
        processedData = job.data;
      });

      const job = await queue.enqueue("email.send", "user@example.com");
      expect(job.id).toBeDefined();

      // Wait for immediate async queue dispatch
      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(processedData).toBe("user@example.com");
    });
  });

  describe("Scheduler Service", () => {
    it("should register and cancel scheduled task", () => {
      const scheduler = new SchedulerService();
      let executed = false;

      scheduler.scheduleInterval("clean", 10000, () => {
        executed = true;
      });

      expect(scheduler.cancel("clean")).toBe(true);
      expect(executed).toBe(false);
    });
  });

  describe("AI Service", () => {
    it("should return completions and embeddings", async () => {
      const ai = new AIService();
      const completion = await ai.complete("Hello world");
      const embeddings = await ai.embed("Hello world");

      expect(completion).toContain("AI Response");
      expect(embeddings.length).toBeGreaterThan(0);
    });
  });
});
