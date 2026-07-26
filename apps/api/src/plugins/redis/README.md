# Redis Plugin

Official Redis integration plugin for the Open Node Backend Platform (ONBP).

## Features
- Connection pool management via `ioredis` package.
- Auto-discovery and registration with `PluginManager` and `ProviderManager`.
- Centralized configuration with fallbacks.
- Live database ping health check.
- Diagnostics status reporting.

## Configuration
Configure connection parameters via `ConfigManager` (either through environment variables or deep JSON properties):

```typescript
redis.url               // connection string (e.g. redis://localhost:6379)
redis.host              // default: localhost
redis.port              // default: 6379
redis.password          // default: undefined
redis.db                // default: 0
plugins.redis.enabled   // default: true
```

## Example Registration

Once placed in `src/plugins/redis`, the `PluginLoader` automatically discovers, imports, and registers this plugin into the `PluginManager` registry.

## Usage Example
```typescript
import { container } from "../../core/container/container.js";
import { REDIS_CONSTANTS } from "./constants.js";

// Resolve Redis client from DI container
const redis = container.resolve<any>(REDIS_CONSTANTS.CLIENT_KEY);

// Cache operations
await redis.set("key", "value");
const value = await redis.get("key");
```

## Troubleshooting

### Connection Failures
- **Error: connect ECONNREFUSED**: Check that the Redis server is running and listening on the port configured in `redis.port` (default `6379`).
- **Mocking in Tests**: Inject a mocked Redis client in unit tests using the `setClient(mockRedis)` helper method on the provider instance.
