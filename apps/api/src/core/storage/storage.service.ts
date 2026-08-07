import type { 
  IStorageService, 
  IStorageProvider, 
  StorageFile,
  BucketInfo,
  UploadOptions,
  ListOptions,
  SignedUrlOptions
} from "./storage.interface.js";
import { LocalStorageProvider } from "./local-storage.provider.js";
import { container } from "../container/container.js";
import { CORE_SERVICES } from "../container/service.constants.js";
import { logger } from "../logger/logger.js";

/**
 * Storage Service – provider-agnostic abstraction for file storage operations.
 * Supports multiple storage providers (local, S3, MinIO, etc.) through a unified interface.
 */
export class StorageService implements IStorageService {
  private readonly providers = new Map<string, IStorageProvider>();
  private defaultProviderName = "local";

  constructor(defaultProvider?: IStorageProvider) {
    if (defaultProvider) {
      this.providers.set("local", defaultProvider);
    } else {
      this.providers.set("local", new LocalStorageProvider());
    }
  }

  /**
   * Get the event bus from the container for publishing events.
   */
  private getEventBus(): any {
    try {
      if (container.has(CORE_SERVICES.EVENT_BUS)) {
        return container.resolve(CORE_SERVICES.EVENT_BUS);
      }
    } catch {
      // Ignore container resolution errors
    }
    return undefined;
  }

  /**
   * Publish a storage event to the event bus.
   */
  private async publishEvent(eventName: string, payload: any): Promise<void> {
    const eventBus = this.getEventBus();
    if (eventBus) {
      Promise.resolve(eventBus.emit(eventName, payload)).catch((err) => logger.error(err, "Failed to emit background event"));
    }
  }

  setProvider(name: string, provider: IStorageProvider): void {
    this.providers.set(name, provider);
  }

  getProvider(name?: string): IStorageProvider {
    const providerName = name || this.defaultProviderName;
    const provider = this.providers.get(providerName);
    if (!provider) {
      throw new Error(`Storage provider '${providerName}' not found.`);
    }
    return provider;
  }

  listProviders(): string[] {
    return Array.from(this.providers.keys());
  }

  setDefaultProvider(name: string): void {
    if (!this.providers.has(name)) {
      throw new Error(`Storage provider '${name}' not registered.`);
    }
    this.defaultProviderName = name;
  }

  async upload(bucket: string, path: string, content: Buffer | string, options?: UploadOptions): Promise<StorageFile> {
    await this.publishEvent("storage.upload.started", { bucket, path, options });
    const result = await this.getProvider().upload(bucket, path, content, options);
    await this.publishEvent("storage.upload.completed", { bucket, path, size: result.size });
    return result;
  }

  async download(bucket: string, path: string): Promise<Buffer> {
    await this.publishEvent("storage.download.started", { bucket, path });
    const result = await this.getProvider().download(bucket, path);
    await this.publishEvent("storage.download.completed", { bucket, path, size: result.length });
    return result;
  }

  async delete(bucket: string, path: string): Promise<boolean> {
    await this.publishEvent("storage.deletion.started", { bucket, path });
    const result = await this.getProvider().delete(bucket, path);
    if (result) {
      await this.publishEvent("storage.deleted", { bucket, path });
    } else {
      await this.publishEvent("storage.deleted.failed", { bucket, path, reason: "file_not_found" });
    }
    return result;
  }

  async exists(bucket: string, path: string): Promise<boolean> {
    return this.getProvider().exists(bucket, path);
  }

  async list(bucket: string, options?: ListOptions): Promise<StorageFile[]> {
    return this.getProvider().list(bucket, options);
  }

  async copy(source: { bucket: string; path: string }, destination: { bucket: string; path: string }): Promise<StorageFile> {
    await this.publishEvent("storage.copy.started", { source, destination });
    const result = await this.getProvider().copy(source, destination);
    await this.publishEvent("storage.copied", { source, destination });
    return result;
  }

  async move(source: { bucket: string; path: string }, destination: { bucket: string; path: string }): Promise<StorageFile> {
    await this.publishEvent("storage.move.started", { source, destination });
    const result = await this.getProvider().move(source, destination);
    await this.publishEvent("storage.moved", { source, destination });
    return result;
  }

  async getMetadata(bucket: string, path: string): Promise<StorageFile> {
    return this.getProvider().getMetadata(bucket, path);
  }

  async generateSignedUrl(bucket: string, path: string, options?: SignedUrlOptions): Promise<string> {
    return this.getProvider().generateSignedUrl(bucket, path, options);
  }

  async createBucket(name: string, bucketOptions?: { region?: string; public?: boolean }): Promise<BucketInfo> {
    const result = await this.getProvider().createBucket(name, bucketOptions);
    await this.publishEvent("storage.bucket.created", { bucket: name, ...bucketOptions });
    return result;
  }

  async deleteBucket(name: string): Promise<void> {
    await this.publishEvent("storage.bucket.deleted", { bucket: name });
    return this.getProvider().deleteBucket(name);
  }

  async bucketExists(name: string): Promise<boolean> {
    return this.getProvider().bucketExists(name);
  }

  async listBuckets(): Promise<BucketInfo[]> {
    return this.getProvider().listBuckets();
  }

  async getStorageStats(): Promise<{ totalBytes: number; totalFiles: number }> {
    return this.getProvider().getStorageStats();
  }

  async getUrl(bucket: string, path: string): Promise<string> {
    return this.getProvider().getUrl(bucket, path);
  }

  async getHealth(): Promise<{ status: "healthy" | "unhealthy"; reason?: string }> {
    return this.getProvider().health?.() || Promise.resolve({ status: "healthy" });
  }

  getDiagnostics(): {
    activeProvider: string;
    registeredProviders: string[];
    statistics: { totalBytes: number; totalFiles: number };
  } {
    const provider = this.getProvider();
    const diagnostics = provider.diagnostics ? provider.diagnostics() : {};
    return {
      activeProvider: this.defaultProviderName,
      registeredProviders: this.listProviders(),
      statistics: { totalBytes: 0, totalFiles: 0 },
      ...diagnostics,
    };
  }
}

export default StorageService;