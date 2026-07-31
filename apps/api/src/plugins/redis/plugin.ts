import type { Container } from "../../core/container/index.js";
import { BasePlugin } from "../../core/plugin-sdk/index.js";
import { RedisProvider } from "./provider.js";
import { REDIS_CONSTANTS } from "./constants.js";
import { RedisCacheProvider } from "./redis-cache.provider.js";
import { RedisQueueProvider } from "./redis-queue.provider.js";
import { container } from "../../core/container/container.js";
import { CORE_SERVICES } from "../../core/container/service.constants.js";

export class RedisPlugin extends BasePlugin {
  readonly name = "redis";
  readonly version = "1.0.0";
  readonly description = "Official Redis integration plugin";
  readonly providers = [new RedisProvider()];

  override async register(containerInstance: Container): Promise<void> {
    containerInstance.registerSingleton(REDIS_CONSTANTS.CLIENT_KEY, () => {
      return this.providers[0].getClient();
    });
  }

  override async boot(): Promise<void> {
    try {
      const redisClient = this.providers[0].getClient();
      if (redisClient) {
        // Cache Provider registration
        if (container.has(CORE_SERVICES.CACHE)) {
          const cacheService = container.resolve<any>(CORE_SERVICES.CACHE);
          const redisCache = new RedisCacheProvider(redisClient);
          cacheService.getManager().registerProvider("redis", redisCache);
          cacheService.getManager().use("redis");
        }

        // Queue Provider registration
        if (container.has(CORE_SERVICES.QUEUE)) {
          const queueService = container.resolve<any>(CORE_SERVICES.QUEUE);
          const redisQueue = new RedisQueueProvider(redisClient);
          queueService.registerProvider("redis", redisQueue);
          queueService.use("redis");
        }
      }
    } catch {
      // Fallback
    }
  }
}
export default RedisPlugin;
