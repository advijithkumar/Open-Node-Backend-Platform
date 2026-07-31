# ONBP Platform Cache Framework Standards

The ONBP Cache Framework provides a generic cache layer abstraction supporting multiple providers (Memory, Redis) and dynamic provider switching, health checking, diagnostics reporting, and EventBus integration.

## Cache contract
The central `ICacheService` and `ICacheProvider` contracts support:
- `get(key)` - Retrieve value.
- `set(key, value, ttl?)` - Store value with optional TTL.
- `has(key)` - Check key existence.
- `delete(key)` - Delete key.
- `clear()` - Flush database/cache space.
- `increment(key, value?)` - Increment integer key value.
- `decrement(key, value?)` - Decrement integer key value.
- `expire(key, ttl)` - Set new TTL for existing key.
- `keys(pattern?)` - List keys matching wildcard pattern.

## Provider Switching & Fallback

By default, CacheManager uses the `MemoryCacheProvider`. If the Redis Plugin is enabled and booted successfully:
1. It registers `RedisCacheProvider` under name `"redis"`.
2. It switches the active provider to `"redis"`.

If the Redis connection fails, the CacheManager falls back to the memory cache or throws depending on configuration.

## Domain Events Published
Every cache operation triggers asynchronous event publication via `EventBus`:
- `cache.hit` - Emitted on cache hits.
- `cache.miss` - Emitted on cache misses.
- `cache.set` - Emitted on key writes.
- `cache.deleted` - Emitted on key deletes.
- `cache.cleared` - Emitted on cache clear.

## Usage Examples

Resolve `cache` singleton:
```typescript
import { container } from "../../core/container/index.js";

const cache = container.resolve<any>("cache");

// Write to cache
await cache.set("user:1:profile", { name: "Ad" }, 300);

// Read from cache
const profile = await cache.get("user:1:profile");

// Remember helper
const profile = await cache.remember("user:1:profile", 300, async () => {
  return fetchUserProfileFromDB();
});
```
