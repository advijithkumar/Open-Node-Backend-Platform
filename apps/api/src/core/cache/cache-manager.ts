import type { ICacheProvider } from "./cache.interface.js";
import { MemoryCacheProvider } from "./memory-cache.provider.js";
import { container } from "../container/container.js";
import { CORE_SERVICES } from "../container/service.constants.js";
import type { IEventBus } from "../events/event.interface.js";
import { logger } from "../logger/logger.js";

export class CacheManager implements ICacheProvider {
  private readonly providers = new Map<string, ICacheProvider>();
  private activeProviderName = "memory";

  // Statistics
  private hitCount = 0;
  private missCount = 0;
  private setCount = 0;
  private deleteCount = 0;
  private clearCount = 0;

  constructor() {
    // Register memory provider by default
    this.registerProvider("memory", new MemoryCacheProvider());
  }

  private getEventBus(): IEventBus | undefined {
    try {
      if (container.has(CORE_SERVICES.EVENT_BUS)) {
        return container.resolve<IEventBus>(CORE_SERVICES.EVENT_BUS);
      }
    } catch (err) {
      logger.warn(err, "Failed to resolve EventBus");
    }
    return undefined;
  }

  registerProvider(name: string, provider: ICacheProvider): void {
    this.providers.set(name, provider);
  }

  use(name: string): void {
    if (!this.providers.has(name)) {
      throw new Error(`Cache provider "${name}" is not registered`);
    }
    this.activeProviderName = name;
  }

  getActiveProvider(): ICacheProvider {
    return this.providers.get(this.activeProviderName) || this.providers.get("memory")!;
  }

  async get<T>(key: string): Promise<T | undefined> {
    const val = await this.getActiveProvider().get<T>(key);
    const eventBus = this.getEventBus();

    if (val !== undefined) {
      this.hitCount++;
      if (eventBus) {
        // Run in background
        Promise.resolve(eventBus.emit("cache.hit", { key })).catch((err) => logger.error(err, "Failed to emit cache.hit event"));
      }
    } else {
      this.missCount++;
      if (eventBus) {
        Promise.resolve(eventBus.emit("cache.miss", { key })).catch((err) => logger.error(err, "Failed to emit cache.miss event"));
      }
    }

    return val;
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    await this.getActiveProvider().set<T>(key, value, ttlSeconds);
    this.setCount++;
    const eventBus = this.getEventBus();
    if (eventBus) {
      Promise.resolve(eventBus.emit("cache.set", { key, ttlSeconds })).catch((err) => logger.error(err, "Failed to emit cache.set event"));
    }
  }

  async delete(key: string): Promise<boolean> {
    const deleted = await this.getActiveProvider().delete(key);
    if (deleted) {
      this.deleteCount++;
      const eventBus = this.getEventBus();
      if (eventBus) {
        Promise.resolve(eventBus.emit("cache.deleted", { key })).catch((err) => logger.error(err, "Failed to emit cache.deleted event"));
      }
    }
    return deleted;
  }

  async clear(): Promise<void> {
    await this.getActiveProvider().clear();
    this.clearCount++;
    const eventBus = this.getEventBus();
    if (eventBus) {
      Promise.resolve(eventBus.emit("cache.cleared", {})).catch((err) => logger.error(err, "Failed to emit cache.cleared event"));
    }
  }

  async has(key: string): Promise<boolean> {
    return this.getActiveProvider().has(key);
  }

  async increment(key: string, value?: number): Promise<number> {
    return this.getActiveProvider().increment(key, value);
  }

  async decrement(key: string, value?: number): Promise<number> {
    return this.getActiveProvider().decrement(key, value);
  }

  async expire(key: string, ttlSeconds: number): Promise<boolean> {
    return this.getActiveProvider().expire(key, ttlSeconds);
  }

  async keys(pattern?: string): Promise<string[]> {
    return this.getActiveProvider().keys(pattern);
  }

  // Health check
  async getHealth(): Promise<{ status: string; error?: string }> {
    try {
      const provider = this.getActiveProvider();
      await provider.set("__health_check__", "ok", 5);
      const val = await provider.get("__health_check__");
      await provider.delete("__health_check__");
      if (val === "ok") {
        return { status: "healthy" };
      }
      return { status: "unhealthy", error: "Cache value mismatch" };
    } catch (err: any) {
      return { status: "unhealthy", error: err.message || String(err) };
    }
  }

  // Diagnostics
  getDiagnostics() {
    return {
      activeProvider: this.activeProviderName,
      registeredProviders: Array.from(this.providers.keys()),
      statistics: {
        hits: this.hitCount,
        misses: this.missCount,
        sets: this.setCount,
        deletes: this.deleteCount,
        clears: this.clearCount,
      },
    };
  }
}
export default CacheManager;
