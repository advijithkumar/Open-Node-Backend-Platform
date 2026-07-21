import fs from "node:fs/promises";
import path from "node:path";
import type { IStorageProvider, StorageFile } from "./storage.interface.js";

export class LocalStorageProvider implements IStorageProvider {
  constructor(private readonly basePath = "./uploads") {}

  private getAbsolutePath(key: string): string {
    return path.resolve(this.basePath, key);
  }

  async upload(key: string, content: Buffer | string, mimeType?: string): Promise<StorageFile> {
    const fullPath = this.getAbsolutePath(key);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    
    const buffer = typeof content === "string" ? Buffer.from(content) : content;
    await fs.writeFile(fullPath, buffer);

    return {
      path: fullPath,
      size: buffer.length,
      mimeType: mimeType ?? "application/octet-stream",
      url: `/uploads/${key}`,
    };
  }

  async download(key: string): Promise<Buffer> {
    const fullPath = this.getAbsolutePath(key);
    return fs.readFile(fullPath);
  }

  async delete(key: string): Promise<boolean> {
    const fullPath = this.getAbsolutePath(key);
    try {
      await fs.unlink(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  async getUrl(key: string): Promise<string> {
    return `/uploads/${key}`;
  }

  async exists(key: string): Promise<boolean> {
    const fullPath = this.getAbsolutePath(key);
    try {
      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }
}
