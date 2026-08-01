import { describe, it, expect, beforeEach } from "vitest";
import { StorageService, LocalStorageProvider } from "./storage/index.js";
import { CacheService, CacheManager, MemoryCacheProvider } from "./cache/index.js";
import { MemoryQueueService } from "./queue/index.js";
import { SchedulerService } from "./scheduler/index.js";
import { AIService } from "./ai/index.js";
import { container } from "./container/container.js";

describe("Phase 2 Enterprise Platform Services", () => {
  describe("Storage Service", () => {
    let storage: StorageService;
    
    beforeEach(() => {
      container.reset();
      storage = new StorageService(new LocalStorageProvider("./test-uploads"));
    });

    it("should upload and retrieve file URL via provider", async () => {
      const result = await storage.upload("bucket", "test.txt", "Hello ONBP");

      expect(result.url).toBe("/uploads/bucket/test.txt");
      expect(await storage.exists("bucket", "test.txt")).toBe(true);

      await storage.delete("bucket", "test.txt");
    });

    it("should list files in a bucket", async () => {
      await storage.upload("bucket", "file1.txt", "content1");
      await storage.upload("bucket", "file2.txt", "content2");

      const files = await storage.list("bucket");
      expect(files.length).toBe(2);

      await storage.delete("bucket", "file1.txt");
      await storage.delete("bucket", "file2.txt");
    });

    it("should create and check bucket existence", async () => {
      const bucketInfo = await storage.createBucket("test-bucket");
      expect(bucketInfo.name).toBe("test-bucket");

      expect(await storage.bucketExists("test-bucket")).toBe(true);

      await storage.deleteBucket("test-bucket");
    });

    it("should check file existence", async () => {
      await storage.upload("bucket", "exists.txt", "content");
      expect(await storage.exists("bucket", "exists.txt")).toBe(true);
      expect(await storage.exists("bucket", "nonexistent.txt")).toBe(false);

      await storage.delete("bucket", "exists.txt");
    });

    it("should copy and move files", async () => {
      await storage.upload("bucket", "source.txt", "content");
      
      await storage.copy(
        { bucket: "bucket", path: "source.txt" },
        { bucket: "bucket", path: "dest.txt" }
      );
      
      expect(await storage.exists("bucket", "dest.txt")).toBe(true);
      
      await storage.delete("bucket", "source.txt");
      await storage.delete("bucket", "dest.txt");
    });

    it("should generate signed URLs", async () => {
      await storage.upload("bucket", "signed.txt", "content");
      const url = await storage.generateSignedUrl("bucket", "signed.txt");
      expect(url).toBe("/uploads/bucket/signed.txt");

      await storage.delete("bucket", "signed.txt");
    });

    it("should get storage stats", async () => {
      const stats = await storage.getStorageStats();
      expect(stats).toHaveProperty("totalBytes");
      expect(stats).toHaveProperty("totalFiles");
    });

    it("should return diagnostics", () => {
      const diagnostics = storage.getDiagnostics();
      expect(diagnostics).toHaveProperty("activeProvider");
      expect(diagnostics).toHaveProperty("registeredProviders");
    });
  });

  describe("Cache Service", () => {
    it("should handle get/set and remember fallback", async () => {
      const manager = new CacheManager();
      manager.registerProvider("memory", new MemoryCacheProvider());
      const cache = new CacheService(manager);
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