import type { Redis } from "ioredis";
import type { ICacheProvider } from "../../core/cache/cache.interface.js";

export class RedisCacheProvider implements ICacheProvider {
  constructor(private readonly client: Redis) {}

  async get<T>(key: string): Promise<T | undefined> {
    const raw = await this.client.get(key);
    if (raw === null || raw === undefined) return undefined;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return raw as unknown as T;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const serialized = typeof value === "string" ? value : JSON.stringify(value);
    if (ttlSeconds) {
      await this.client.set(key, serialized, "EX", ttlSeconds);
    } else {
      await this.client.set(key, serialized);
    }
  }

  async delete(key: string): Promise<boolean> {
    const deleted = await this.client.del(key);
    return deleted > 0;
  }

  async clear(): Promise<void> {
    await this.client.flushdb();
  }

  async has(key: string): Promise<boolean> {
    const exists = await this.client.exists(key);
    return exists > 0;
  }

  async increment(key: string, value = 1): Promise<number> {
    return this.client.incrby(key, value);
  }

  async decrement(key: string, value = 1): Promise<number> {
    return this.client.decrby(key, value);
  }

  async expire(key: string, ttlSeconds: number): Promise<boolean> {
    const res = await this.client.expire(key, ttlSeconds);
    return res === 1;
  }

  async keys(pattern = "*"): Promise<string[]> {
    return this.client.keys(pattern);
  }
}
export default RedisCacheProvider;
