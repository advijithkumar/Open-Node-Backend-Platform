import type { ICacheProvider } from "./cache.interface.js";

interface CacheEntry<T = unknown> {
  value: T;
  expiresAt?: number;
}

export class MemoryCacheProvider implements ICacheProvider {
  private readonly store = new Map<string, CacheEntry>();

  async get<T>(key: string): Promise<T | undefined> {
    const entry = this.store.get(key);
    if (!entry) return undefined;

    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }

    return entry.value as T;
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined;
    this.store.set(key, { value, expiresAt });
  }

  async delete(key: string): Promise<boolean> {
    return this.store.delete(key);
  }

  async clear(): Promise<void> {
    this.store.clear();
  }

  async has(key: string): Promise<boolean> {
    const val = await this.get(key);
    return val !== undefined;
  }

  async increment(key: string, value = 1): Promise<number> {
    const raw = await this.get<unknown>(key);
    const num = typeof raw === "number" ? raw : 0;
    const next = num + value;
    await this.set(key, next);
    return next;
  }

  async decrement(key: string, value = 1): Promise<number> {
    const raw = await this.get<unknown>(key);
    const num = typeof raw === "number" ? raw : 0;
    const next = num - value;
    await this.set(key, next);
    return next;
  }

  async expire(key: string, ttlSeconds: number): Promise<boolean> {
    const entry = this.store.get(key);
    if (!entry) return false;

    // Check if already expired
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return false;
    }

    entry.expiresAt = Date.now() + ttlSeconds * 1000;
    return true;
  }

  async keys(pattern = "*"): Promise<string[]> {
    // Clear expired items first
    for (const key of this.store.keys()) {
      await this.get(key);
    }

    const regexPattern = "^" + pattern.replace(/\*/g, ".*").replace(/\?/g, ".") + "$";
    const regex = new RegExp(regexPattern);

    return Array.from(this.store.keys()).filter((k) => regex.test(k));
  }
}
export default MemoryCacheProvider;
