import { Client } from "minio";
import { BaseProvider } from "../../core/plugin-sdk/index.js";
import { config } from "./config.js";
import type { StorageFile, BucketInfo, UploadOptions, ListOptions, SignedUrlOptions, IStorageProvider } from "../../core/storage/index.js";

/**
 * MinIO storage provider for ONBP framework.
 * Implements IStorageProvider to integrate with the Storage Service.
 */
export class MinioProvider extends BaseProvider<Client> implements IStorageProvider {
  readonly name = "minio";
  readonly type = "storage";
  readonly version = "1.0.0";
  readonly plugin = "minio";

  override isConfigEnabled(): boolean {
    return config.enabled;
  }

  override async ping(client: Client): Promise<void> {
    await client.listBuckets();
  }

  override async createClient(): Promise<Client> {
    return new Client({
      endPoint: config.endpoint,
      port: config.port,
      useSSL: config.useSSL,
      accessKey: config.accessKey,
      secretKey: config.secretKey,
    });
  }

  override async closeClient(_client: Client): Promise<void> {
    // Minio client uses HTTP request agent, no connection shutdown needed
  }

  override getCustomDiagnostics(): Record<string, unknown> {
    return {
      endpoint: config.endpoint,
      port: config.port,
      bucket: config.bucket,
      useSSL: config.useSSL,
    };
  }

  /**
   * Upload a file to MinIO
   */
  async upload(bucket: string, path: string, content: Buffer | string, options?: UploadOptions): Promise<StorageFile> {
    const client = this.getClient();
    const buffer = typeof content === "string" ? Buffer.from(content) : content;

    const mimeType = options?.mimeType || "application/octet-stream";
    await client.putObject(bucket, path, buffer, buffer.length, { contentType: mimeType });

    return {
      path: `${bucket}/${path}`,
      size: buffer.length,
      mimeType: mimeType,
      url: `https://${config.endpoint}:${config.port}/${bucket}/${path}`,
    };
  }

  /**
   * Download a file from MinIO
   */
  async download(bucket: string, path: string): Promise<Buffer> {
    const client = this.getClient();
    const data = await client.getObject(bucket, path);
    const chunks: Buffer[] = [];

    return new Promise((resolve, reject) => {
      data.on("data", (chunk: Buffer) => chunks.push(chunk));
      data.on("end", () => resolve(Buffer.concat(chunks)));
      data.on("error", reject);
    });
  }

  /**
   * Delete a file from MinIO
   */
  async delete(bucket: string, path: string): Promise<boolean> {
    try {
      const client = this.getClient();
      await client.removeObject(bucket, path);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if a file exists in MinIO
   */
  async exists(bucket: string, path: string): Promise<boolean> {
    try {
      const client = this.getClient();
      await client.statObject(bucket, path);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * List files in a bucket
   */
  async list(bucket: string, options?: ListOptions): Promise<StorageFile[]> {
    const client = this.getClient();
    const objects: StorageFile[] = [];

    const prefix = options?.prefix || "";
    let count = 0;

    const stream = client.listObjects(bucket, prefix, false);

    return new Promise((resolve, reject) => {
      stream.on("data", (obj: any) => {
        if (options?.limit && count >= options.limit) {
          stream.destroy();
          resolve(objects);
          return;
        }
        if (!obj.key) return;

        objects.push({
          path: obj.key,
          size: obj.size || 0,
          url: `https://${config.endpoint}:${config.port}/${bucket}/${obj.key}`,
        });
        count++;
      });

      stream.on("end", () => resolve(objects));
      stream.on("error", reject);
    });
  }

  /**
   * Copy an object between buckets/paths
   */
  async copy(source: { bucket: string; path: string }, destination: { bucket: string; path: string }): Promise<StorageFile> {
    const client = this.getClient();
    await (client as any).copyObject(source.bucket, source.path, destination.bucket, destination.path);

    return {
      path: `${destination.bucket}/${destination.path}`,
      size: 0,
      url: `https://${config.endpoint}:${config.port}/${destination.bucket}/${destination.path}`,
    };
  }

  /**
   * Move an object (copy then delete)
   */
  async move(source: { bucket: string; path: string }, destination: { bucket: string; path: string }): Promise<StorageFile> {
    const client = this.getClient();

    await (client as any).copyObject(source.bucket, source.path, destination.bucket, destination.path);
    await client.removeObject(source.bucket, source.path);

    return {
      path: `${destination.bucket}/${destination.path}`,
      size: 0,
      url: `https://${config.endpoint}:${config.port}/${destination.bucket}/${destination.path}`,
    };
  }

  /**
   * Get object metadata
   */
  async getMetadata(bucket: string, path: string): Promise<StorageFile> {
    const client = this.getClient();
    const stat = await client.statObject(bucket, path);

    return {
      path: `${bucket}/${path}`,
      size: stat.size || 0,
      mimeType: stat.metaData?.["application/octet-stream"] || "application/octet-stream",
      url: `https://${config.endpoint}:${config.port}/${bucket}/${path}`,
    };
  }

  /**
   * Generate a pre-signed URL for an object
   */
  async generateSignedUrl(bucket: string, path: string, options?: SignedUrlOptions): Promise<string> {
    const client = this.getClient();
    const expiry = options?.expires || 3600;
    return client.presignedGetObject(bucket, path, expiry);
  }

  /**
   * Create a bucket
   */
  async createBucket(name: string, bucketOptions?: { region?: string; public?: boolean }): Promise<BucketInfo> {
    const client = this.getClient();
    await client.makeBucket(name, bucketOptions?.region);

    return {
      name,
      createdAt: new Date(),
      region: bucketOptions?.region,
      public: bucketOptions?.public,
    };
  }

  /**
   * Delete a bucket
   */
  async deleteBucket(name: string): Promise<void> {
    const client = this.getClient();
    await client.removeBucket(name);
  }

  /**
   * Check if a bucket exists
   */
  async bucketExists(name: string): Promise<boolean> {
    const client = this.getClient();
    try {
      await client.bucketExists(name);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * List all buckets
   */
  async listBuckets(): Promise<BucketInfo[]> {
    const client = this.getClient();
    const buckets = await client.listBuckets();

    return buckets.map((b: any) => ({
      name: b.name,
      createdAt: b.created || new Date(),
    }));
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(): Promise<{ totalBytes: number; totalFiles: number }> {
    const client = this.getClient();
    let totalBytes = 0;
    let totalFiles = 0;

    const buckets = await client.listBuckets();

    for (const bucket of buckets) {
      const stream = client.listObjects(bucket.name, "", true);

      await new Promise<void>((resolve) => {
        stream.on("data", (obj: any) => {
          totalBytes += obj.size || 0;
          totalFiles++;
        });
        stream.on("end", () => resolve());
        stream.on("error", () => resolve());
      });
    }

    return { totalBytes, totalFiles };
  }

  /**
   * Get URL for file access
   */
  async getUrl(bucket: string, path: string): Promise<string> {
    return `https://${config.endpoint}:${config.port}/${bucket}/${path}`;
  }

  /**
   * Health check for MinIO
   */
  async health(): Promise<{ status: "healthy" | "unhealthy"; reason?: string }> {
    try {
      const client = this.getClient();
      await client.listBuckets();
      return { status: "healthy" };
    } catch (err: any) {
      return { status: "unhealthy", reason: err.message };
    }
  }

  /**
   * Get diagnostics for MinIO
   */
  async diagnostics(): Promise<Record<string, any>> {
    return {
      name: this.name,
      type: this.type,
      version: this.version,
      enabled: this.enabled,
      hasClient: !!this.client,
      endpoint: config.endpoint,
      port: config.port,
      bucket: config.bucket,
      useSSL: config.useSSL,
    };
  }
}

export default MinioProvider;