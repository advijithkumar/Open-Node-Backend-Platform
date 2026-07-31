# MinIO Plugin

Official MinIO storage integration plugin for the Open Node Backend Platform (ONBP).

## Features
- Storage service client adapter via `minio` package.
- Auto-discovery and registration with `PluginManager` and `ProviderManager`.
- Centralized configuration with fallbacks.
- Live bucket list query health check.
- Diagnostics status reporting.

## Configuration
Configure connection parameters via `ConfigManager` (either through environment variables or deep JSON properties):

```typescript
minio.endpoint          // default: localhost
minio.port              // default: 9000
minio.useSSL            // default: false
minio.accessKey         // access key
minio.secretKey         // secret key
minio.bucket            // default: onbp-bucket
plugins.minio.enabled   // default: true
```

## Example Registration

Once placed in `src/plugins/minio`, the `PluginLoader` automatically discovers, imports, and registers this plugin into the `PluginManager` registry.

## Usage Example
```typescript
import { container } from "../../core/container/container.js";
import { MINIO_CONSTANTS } from "./constants.js";

// Resolve MinIO client from DI container
const minio = container.resolve<any>(MINIO_CONSTANTS.CLIENT_KEY);

// Storage operations
const buckets = await minio.listBuckets();
```

## Troubleshooting

### Connection Failures
- **Error: connect ECONNREFUSED**: Check that your MinIO server is running and listening on the port configured in `minio.port` (default `9000`).
- **Mocking in Tests**: Inject a mocked MinIO client in unit tests using the `setClient(mockMinio)` helper method on the provider instance.
