import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from "vitest";
import { Readable } from "node:stream";
import fs from "node:fs/promises";
import path from "node:path";
import { StorageService, LocalStorageProvider } from "../../../apps/api/src/core/storage/index.js";
import { MinioProvider } from "../../../apps/api/src/plugins/minio/provider.js";
import { container } from "../../../apps/api/src/core/container/container.js";
import { CORE_SERVICES } from "../../../apps/api/src/core/container/service.constants.js";
import { DiscoveryService } from "../../../apps/api/src/core/discovery/discovery.service.js";

describe("Storage Ecosystem Integration & Verification", () => {
  let storageService: StorageService;
  let localProvider: LocalStorageProvider;
  let minioProvider: MinioProvider;
  let mockEventBus: any;
  let mockMinioClient: any;
  const localTestDir = path.resolve("./test-ecosystem-uploads");

  beforeAll(() => {
    // Setup Mock Config Manager for MinIO config resolution
    const mockConfigManager = {
      get: (key: string, defaultValue?: any) => {
        if (key === "plugins.minio.enabled") return true;
        if (key === "minio.endpoint") return "localhost";
        if (key === "minio.port") return 9000;
        return defaultValue;
      }
    };
    
    const definitions = (container as any).definitions;
    definitions.delete(CORE_SERVICES.CONFIG);
    container.registerSingleton(CORE_SERVICES.CONFIG, () => mockConfigManager);
  });

  beforeEach(async () => {
    // Cleanup local test dir
    await fs.rm(localTestDir, { recursive: true, force: true }).catch(() => {});
    await fs.mkdir(localTestDir, { recursive: true });

    // Mock Event Bus
    mockEventBus = {
      emit: vi.fn().mockResolvedValue(undefined),
    };
    
    // Register event bus on container
    const definitions = (container as any).definitions;
    definitions.delete(CORE_SERVICES.EVENT_BUS);
    const singletons = (container as any).singletons;
    singletons.delete(CORE_SERVICES.EVENT_BUS);
    container.registerSingleton(CORE_SERVICES.EVENT_BUS, () => mockEventBus);

    // Setup Local provider
    localProvider = new LocalStorageProvider(localTestDir);
    storageService = new StorageService(localProvider);

    // Setup MinIO provider and mock client
    minioProvider = new MinioProvider();
    mockMinioClient = {
      listBuckets: vi.fn().mockResolvedValue([{ name: "minio-bucket", created: new Date() }]),
      putObject: vi.fn().mockResolvedValue({ etag: "123" }),
      getObject: vi.fn().mockImplementation(() => {
        const stream = new Readable();
        stream.push("minio content");
        stream.push(null);
        return Promise.resolve(stream);
      }),
      removeObject: vi.fn().mockResolvedValue(undefined),
      statObject: vi.fn().mockResolvedValue({ size: 13, metaData: { "application/octet-stream": "application/octet-stream" } }),
      listObjects: vi.fn().mockImplementation(() => {
        const stream = new Readable({ objectMode: true });
        stream.push({ key: "minio.txt", size: 13 });
        stream.push(null);
        return stream;
      }),
      copyObject: vi.fn().mockResolvedValue(undefined),
      presignedGetObject: vi.fn().mockResolvedValue("https://signed-minio-url.com"),
      makeBucket: vi.fn().mockResolvedValue(undefined),
      removeBucket: vi.fn().mockResolvedValue(undefined),
      bucketExists: vi.fn().mockResolvedValue(true),
    };
    minioProvider.setClient(mockMinioClient);
    await minioProvider.boot();

    storageService.setProvider("minio", minioProvider);

    // Register Storage Service in the Container
    definitions.delete(CORE_SERVICES.STORAGE);
    singletons.delete(CORE_SERVICES.STORAGE);
    container.registerSingleton(CORE_SERVICES.STORAGE, () => storageService);
  });

  afterEach(async () => {
    await fs.rm(localTestDir, { recursive: true, force: true }).catch(() => {});
  });

  describe("LocalStorageProvider End-to-End", () => {
    it("should perform all storage operations locally", async () => {
      // 1. Bucket Operations
      await storageService.createBucket("local-bucket");
      expect(await storageService.bucketExists("local-bucket")).toBe(true);

      // 2. Upload/Exists/Download
      await storageService.upload("local-bucket", "test.txt", "hello local");
      expect(await storageService.exists("local-bucket", "test.txt")).toBe(true);

      const data = await storageService.download("local-bucket", "test.txt");
      expect(data.toString()).toBe("hello local");

      // 3. Metadata
      const metadata = await storageService.getMetadata("local-bucket", "test.txt");
      expect(metadata.size).toBe(11);

      // 4. Listing
      const list = await storageService.list("local-bucket");
      expect(list.length).toBe(1);
      expect(list[0].path).toContain("test.txt");

      // 5. Copy/Move
      await storageService.copy(
        { bucket: "local-bucket", path: "test.txt" },
        { bucket: "local-bucket", path: "copied.txt" }
      );
      expect(await storageService.exists("local-bucket", "copied.txt")).toBe(true);

      await storageService.move(
        { bucket: "local-bucket", path: "copied.txt" },
        { bucket: "local-bucket", path: "moved.txt" }
      );
      expect(await storageService.exists("local-bucket", "moved.txt")).toBe(true);
      expect(await storageService.exists("local-bucket", "copied.txt")).toBe(false);

      // 6. Delete File / Bucket
      await storageService.delete("local-bucket", "test.txt");
      expect(await storageService.exists("local-bucket", "test.txt")).toBe(false);

      await storageService.deleteBucket("local-bucket");
      expect(await storageService.bucketExists("local-bucket")).toBe(false);

      // 7. EventBus integration verification
      expect(mockEventBus.emit).toHaveBeenCalledWith("storage.upload.completed", expect.any(Object));
      expect(mockEventBus.emit).toHaveBeenCalledWith("storage.download.completed", expect.any(Object));
    });
  });

  describe("MinioProvider End-to-End via mock", () => {
    it("should perform all storage operations against MinIO", async () => {
      storageService.setDefaultProvider("minio");

      // 1. Bucket Operations
      await storageService.createBucket("minio-bucket");
      expect(mockMinioClient.makeBucket).toHaveBeenCalledWith("minio-bucket", undefined);

      expect(await storageService.bucketExists("minio-bucket")).toBe(true);
      expect(mockMinioClient.bucketExists).toHaveBeenCalledWith("minio-bucket");

      // 2. Upload/Exists/Download
      await storageService.upload("minio-bucket", "test.txt", "hello minio");
      expect(mockMinioClient.putObject).toHaveBeenCalled();

      const exists = await storageService.exists("minio-bucket", "test.txt");
      expect(exists).toBe(true);

      const data = await storageService.download("minio-bucket", "test.txt");
      expect(data.toString()).toBe("minio content");

      // 3. Metadata & Signed URL
      const metadata = await storageService.getMetadata("minio-bucket", "test.txt");
      expect(metadata.size).toBe(13);

      const url = await storageService.generateSignedUrl("minio-bucket", "test.txt");
      expect(url).toBe("https://signed-minio-url.com");

      // 4. Listing & Stats
      const list = await storageService.list("minio-bucket");
      expect(list.length).toBe(1);

      const stats = await storageService.getStorageStats();
      expect(stats.totalFiles).toBeGreaterThanOrEqual(1);

      // 5. Diagnostics & Health
      const diagnostics = storageService.getDiagnostics();
      expect(diagnostics.activeProvider).toBe("minio");
      
      const health = await storageService.getHealth();
      expect(health.status).toBe("healthy");

      // 6. Delete File / Bucket
      await storageService.delete("minio-bucket", "test.txt");
      expect(mockMinioClient.removeObject).toHaveBeenCalledWith("minio-bucket", "test.txt");

      await storageService.deleteBucket("minio-bucket");
      expect(mockMinioClient.removeBucket).toHaveBeenCalledWith("minio-bucket");
    });
  });

  describe("DiscoveryService Integration", () => {
    it("should report storage configuration and diagnostics correctly", async () => {
      const discovery = new DiscoveryService();
      
      storageService.setDefaultProvider("local");
      const summaryLocal = await discovery.getSummary();
      expect(summaryLocal.storage).toBe(1);
      expect(summaryLocal.storageDiagnostics.activeProvider).toBe("local");

      storageService.setDefaultProvider("minio");
      const summaryMinio = await discovery.getSummary();
      expect(summaryMinio.storageDiagnostics.activeProvider).toBe("minio");
      expect(summaryMinio.storageDiagnostics.health).toBe("healthy");
    });
  });
});
