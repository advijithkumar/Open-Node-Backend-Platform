import type { ICacheService, ICacheProvider } from "./cache.interface.js";
import { MemoryCacheProvider } from "./memory-cache.provider.js";

export class CacheService implements ICacheService {
  constructor(private readonly provider: ICacheProvider = new MemoryCacheProvider()) {}

  async get<T>(key: string): Promise<T | undefined> {
    return this.provider.get<T>(key);
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    return this.provider.set<T>(key, value, ttlSeconds);
  }

  async delete(key: string): Promise<boolean> {
    return this.provider.delete(key);
  }

  async clear(): Promise<void> {
    return this.provider.clear();
  }

  async has(key: string): Promise<boolean> {
    return this.provider.has(key);
  }

  async remember<T>(key: string, ttlSeconds: number, factory: () => Promise<T>): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== undefined) {
      return cached;
    }

    const value = await factory();
    await this.set(key, value, ttlSeconds);
    return value;
  }
}
