import fs from "node:fs/promises";
import path from "node:path";
import type {
  IStorageProvider,
  StorageFile,
  BucketInfo,
  UploadOptions,
  ListOptions,
  SignedUrlOptions,
} from "./storage.interface.js";

export class LocalStorageProvider implements IStorageProvider {
  private readonly basePath: string;

  constructor(basePath: string = "./uploads") {
    this.basePath = basePath;
  }

  private getBucketPath(bucket: string): string {
    return path.resolve(this.basePath, bucket);
  }

  private getAbsolutePath(bucket: string, key: string): string {
    return path.resolve(this.getBucketPath(bucket), key);
  }

  async upload(bucket: string, key: string, content: Buffer | string, options?: UploadOptions): Promise<StorageFile> {
    const fullPath = this.getAbsolutePath(bucket, key);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });

    const buffer = typeof content === "string" ? Buffer.from(content) : content;
    await fs.writeFile(fullPath, buffer);

    return {
      path: fullPath,
      size: buffer.length,
      mimeType: options?.mimeType ?? "application/octet-stream",
      url: `/uploads/${bucket}/${key}`,
    };
  }

  async download(bucket: string, key: string): Promise<Buffer> {
    const fullPath = this.getAbsolutePath(bucket, key);
    return fs.readFile(fullPath);
  }

  async delete(bucket: string, key: string): Promise<boolean> {
    const fullPath = this.getAbsolutePath(bucket, key);
    try {
      await fs.unlink(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  async exists(bucket: string, key: string): Promise<boolean> {
    const fullPath = this.getAbsolutePath(bucket, key);
    try {
      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  async list(bucket: string, options?: ListOptions): Promise<StorageFile[]> {
    const bucketPath = this.getBucketPath(bucket);
    // eslint-disable-next-line no-useless-assignment
    let files: string[] = [];

    try {
      const entries = await fs.readdir(bucketPath, { withFileTypes: true });
      files = entries
        .filter((entry) => entry.isFile())
        .map((entry) => entry.name);
    } catch {
      if (options?.prefix) {
        return [];
      }
      throw new Error(`Bucket '${bucket}' does not exist`);
    }

    const prefix = options?.prefix;
    if (prefix) {
      files = files.filter((f) => f.startsWith(prefix));
    }

    if (options?.limit) {
      files = files.slice(0, options.limit);
    }

    const result: StorageFile[] = [];
    for (const file of files) {
      try {
        const filePath = path.join(bucketPath, file);
        const stat = await fs.stat(filePath);
        result.push({
          path: filePath,
          size: stat.size,
          url: `/uploads/${bucket}/${file}`,
        });
      } catch {
        // Skip files that can't be read
      }
    }

    return result;
  }

  async copy(source: { bucket: string; path: string }, destination: { bucket: string; path: string }): Promise<StorageFile> {
    const destPath = this.getAbsolutePath(destination.bucket, destination.path);

    await fs.mkdir(path.dirname(destPath), { recursive: true });

    const content = await this.download(source.bucket, source.path);
    await fs.writeFile(destPath, content);

    const stat = await fs.stat(destPath);
    return {
      path: destPath,
      size: stat.size,
      url: `/uploads/${destination.bucket}/${destination.path}`,
    };
  }

  async move(source: { bucket: string; path: string }, destination: { bucket: string; path: string }): Promise<StorageFile> {
    const result = await this.copy(source, destination);
    await this.delete(source.bucket, source.path);
    return result;
  }

  async getMetadata(bucket: string, path: string): Promise<StorageFile> {
    const fullPath = this.getAbsolutePath(bucket, path);
    const stat = await fs.stat(fullPath);

    return {
      path: fullPath,
      size: stat.size,
      url: `/uploads/${bucket}/${path}`,
    };
  }

  async generateSignedUrl(_bucket: string, _path: string, _options?: SignedUrlOptions): Promise<string> {
    // Local filesystem doesn't need signed URLs
    return `/uploads/${_bucket}/${_path}`;
  }

  async createBucket(name: string, _options?: { region?: string; public?: boolean }): Promise<BucketInfo> {
    const bucketPath = this.getBucketPath(name);
    await fs.mkdir(bucketPath, { recursive: true });

    return {
      name,
      createdAt: new Date(),
    };
  }

  async deleteBucket(name: string): Promise<void> {
    const bucketPath = this.getBucketPath(name);
    await fs.rm(bucketPath, { recursive: true, force: true });
  }

  async bucketExists(name: string): Promise<boolean> {
    const bucketPath = this.getBucketPath(name);
    try {
      await fs.access(bucketPath);
      return true;
    } catch {
      return false;
    }
  }

  async listBuckets(): Promise<BucketInfo[]> {
    const buckets: BucketInfo[] = [];

    try {
      await fs.access(this.basePath);
      const entries = await fs.readdir(this.basePath, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.isDirectory()) {
          try {
            const bucketPath = path.join(this.basePath, entry.name);
            const stat = await fs.stat(bucketPath);
            buckets.push({
              name: entry.name,
              createdAt: new Date(stat.atime),
            });
          } catch {
            // Skip buckets we can't read
          }
        }
      }
    } catch {
      // Base path doesn't exist
    }

    return buckets;
  }

  async getStorageStats(): Promise<{ totalBytes: number; totalFiles: number }> {
    let totalBytes = 0;
    let totalFiles = 0;

    async function walk(dir: string): Promise<void> {
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            await walk(fullPath);
          } else if (entry.isFile()) {
            const stat = await fs.stat(fullPath);
            totalBytes += stat.size;
            totalFiles++;
          }
        }
      } catch {
        // Ignore errors
      }
    }

    try {
      await walk(this.basePath);
    } catch {
      // No buckets or no access
    }

    return { totalBytes, totalFiles };
  }

  async getUrl(bucket: string, key: string): Promise<string> {
    return `/uploads/${bucket}/${key}`;
  }

  async health(): Promise<{ status: "healthy" | "unhealthy"; error?: string }> {
    try {
      await fs.mkdir(this.basePath, { recursive: true });
      await fs.access(this.basePath);
      return { status: "healthy" };
    } catch (err: any) {
      return { status: "unhealthy", error: err.message };
    }
  }

  async diagnostics(): Promise<Record<string, any>> {
    return {
      basePath: this.basePath,
    };
  }
}

export default LocalStorageProvider;