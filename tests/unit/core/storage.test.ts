import { describe, it, expect, beforeAll, afterAll, beforeEach,afterEach } from "vitest";
import { StorageService, LocalStorageProvider } from "../../../apps/api/src/core/storage/index.js";
import { container } from "../../../apps/api/src/core/container/container.js";

describe("Storage Service Integration Tests", () => {
  let storage: StorageService;
  let testBucket: string;

  beforeEach(() => {
    container.reset();
    testBucket = `test-bucket-${Date.now()}`;
    storage = new StorageService(new LocalStorageProvider("./test-uploads"));
  });

  afterEach(async () => {
    // Cleanup
    try {
      await storage.deleteBucket(testBucket);
    } catch {
      // Ignore
    }
  });

  describe("File Operations", () => {
    it("should upload and download files", async () => {
      const content = "Test content";
      await storage.upload(testBucket, "test.txt", content);

      const exists = await storage.exists(testBucket, "test.txt");
      expect(exists).toBe(true);

      const downloaded = await storage.download(testBucket, "test.txt");
      expect(downloaded.toString()).toBe(content);

      await storage.delete(testBucket, "test.txt");
    });

    it("should list files in bucket", async () => {
      await storage.upload(testBucket, "file1.txt", "content1");
      await storage.upload(testBucket, "file2.txt", "content2");

      const files = await storage.list(testBucket);
      expect(files).toHaveLength(2);

      await storage.deleteBucket(testBucket);
    });

    it("should copy files", async () => {
      await storage.upload(testBucket, "source.txt", "content");

      await storage.copy(
        { bucket: testBucket, path: "source.txt" },
        { bucket: testBucket, path: "dest.txt" }
      );

      expect(await storage.exists(testBucket, "dest.txt")).toBe(true);

      await storage.deleteBucket(testBucket);
    });

    it("should move files", async () => {
      await storage.upload(testBucket, "source.txt", "content");

      await storage.move(
        { bucket: testBucket, path: "source.txt" },
        { bucket: testBucket, path: "moved.txt" }
      );

      expect(await storage.exists(testBucket, "moved.txt")).toBe(true);
      expect(await storage.exists(testBucket, "source.txt")).toBe(false);

      await storage.deleteBucket(testBucket);
    });

    it("should get file metadata", async () => {
      await storage.upload(testBucket, "meta.txt", "test content");

      const meta = await storage.getMetadata(testBucket, "meta.txt");
      expect(meta.path).toContain("meta.txt");
      expect(meta.size).toBeGreaterThan(0);

      await storage.deleteBucket(testBucket);
    });
  });

  describe("Bucket Operations", () => {
    it("should create and check bucket existence", async () => {
      await storage.createBucket(testBucket);
      expect(await storage.bucketExists(testBucket)).toBe(true);

      await storage.deleteBucket(testBucket);
    });

    it("should list buckets", async () => {
      const buckets = await storage.listBuckets();
      expect(Array.isArray(buckets)).toBe(true);
    });

    it("should delete bucket", async () => {
      await storage.createBucket(testBucket);
      await storage.upload(testBucket, "file.txt", "content");

      await storage.deleteBucket(testBucket);
      expect(await storage.bucketExists(testBucket)).toBe(false);
    });
  });

  describe("Health and Diagnostics", () => {
    it("should return health status", async () => {
      const health = await storage.getHealth();
      expect(health).toHaveProperty("status");
    });

    it("should return diagnostics", () => {
      const diag = storage.getDiagnostics();
      expect(diag).toHaveProperty("activeProvider");
      expect(diag).toHaveProperty("registeredProviders");
      expect(diag).toHaveProperty("statistics");
    });

    it("should return storage stats", async () => {
      const stats = await storage.getStorageStats();
      expect(stats).toHaveProperty("totalBytes");
      expect(stats).toHaveProperty("totalFiles");
    });
  });

  describe("Provider Management", () => {
    it("should support multiple providers", () => {
      const customProvider = new LocalStorageProvider("./custom");
      storage.setProvider("custom", customProvider);

      expect(storage.listProviders()).toContain("local");
      expect(storage.listProviders()).toContain("custom");
    });

    it("should get specific provider", () => {
      const provider = storage.getProvider("local");
      expect(provider).toBeInstanceOf(LocalStorageProvider);
    });

    it("should throw for non-existent provider", () => {
      expect(() => storage.getProvider("nonexistent")).toThrow();
    });
  });
});