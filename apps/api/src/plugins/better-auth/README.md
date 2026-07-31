# Better Auth Plugin

Official Better Auth integration plugin for the Open Node Backend Platform (ONBP).

## Features
- Complete authentication client adapter via `better-auth` package.
- Auto-discovery and registration with `PluginManager` and `ProviderManager`.
- Centralized configuration with fallbacks.
- Request handler validation health checks.
- Diagnostics status reporting.

## Configuration
Configure connection parameters via `ConfigManager` (either through environment variables or deep JSON properties):

```typescript
auth.secret                 // authentication secret key
auth.baseUrl                // default: http://localhost:8080
auth.trustedOrigins         // trusted origins
auth.session                // session settings object
auth.cookie                 // cookie settings object
plugins.better-auth.enabled // default: true
```

## Example Registration

Once placed in `src/plugins/better-auth`, the `PluginLoader` automatically discovers, imports, and registers this plugin into the `PluginManager` registry.

## Usage Example
```typescript
import { container } from "../../core/container/container.js";
import { BETTER_AUTH_CONSTANTS } from "./constants.js";

// Resolve Better Auth instance from DI container
const auth = container.resolve<any>(BETTER_AUTH_CONSTANTS.CLIENT_KEY);

// Use request handler in Express middleware
app.all("/api/auth/*", auth.handler);
```

## Troubleshooting

### Connection Failures
- **Error: Failed to initialize Better Auth**: Verify that your database adapter configuration is valid.
- **Mocking in Tests**: Inject a mocked Better Auth client in unit tests using the `setClient(mockAuth)` helper method on the provider instance.
