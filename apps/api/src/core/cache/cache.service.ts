import type { ICacheService } from "./cache.interface.js";
import { CacheManager } from "./cache-manager.js";

export class CacheService implements ICacheService {
  constructor(private readonly manager: CacheManager = new CacheManager()) {}

  async get<T>(key: string): Promise<T | undefined> {
    return this.manager.get<T>(key);
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    return this.manager.set<T>(key, value, ttlSeconds);
  }

  async delete(key: string): Promise<boolean> {
    return this.manager.delete(key);
  }

  async clear(): Promise<void> {
    return this.manager.clear();
  }

  async has(key: string): Promise<boolean> {
    return this.manager.has(key);
  }

  async increment(key: string, value?: number): Promise<number> {
    return this.manager.increment(key, value);
  }

  async decrement(key: string, value?: number): Promise<number> {
    return this.manager.decrement(key, value);
  }

  async expire(key: string, ttlSeconds: number): Promise<boolean> {
    return this.manager.expire(key, ttlSeconds);
  }

  async keys(pattern?: string): Promise<string[]> {
    return this.manager.keys(pattern);
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

  getManager(): CacheManager {
    return this.manager;
  }
}
export default CacheService;
