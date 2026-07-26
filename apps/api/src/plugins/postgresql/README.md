# PostgreSQL Plugin

Official PostgreSQL integration plugin for the Open Node Backend Platform (ONBP).

## Features
- Connection pool management via `postgres` package.
- Auto-discovery and registration with `PluginManager` and `ProviderManager`.
- Centralized configuration with fallbacks.
- Live database ping health check.
- Pool diagnostics status reporting.

## Configuration
Configure connection parameters via `ConfigManager` (either through environment variables or deep JSON properties):

```typescript
database.url          // e.g. postgresql://user:pass@localhost:5432/dbname
database.host         // default: localhost
database.port         // default: 5432
database.username     // default: postgres
database.password     // default: ""
database.database     // default: postgres
database.max          // pool limit (default: 10)
database.idle_timeout // idle timeout in seconds (default: 30)
plugins.postgresql.enabled // default: true
```

## Example Registration

Once placed in `src/plugins/postgresql`, the `PluginLoader` automatically discovers, imports, and registers this plugin into the `PluginManager` registry.

## Usage Example
```typescript
import { container } from "../../core/container/container.js";
import { POSTGRESQL_CONSTANTS } from "./constants.js";

// Resolve SQL query client from DI container
const sql = container.resolve<any>(POSTGRESQL_CONSTANTS.CLIENT_KEY);

// Query execution
const users = await sql`SELECT * FROM users`;
```

## Troubleshooting

### Connection Failures
- **Error: password authentication failed for user**: Ensure your configured `database.password` and `database.username` matches your Postgres instance.
- **Error: connect ECONNREFUSED**: Check that the Postgres server is running and listening on the port configured in `database.port` (default `5432`).
- **Mocking in Tests**: Inject a mocked SQL client in unit tests using the `setClient(mockSql)` helper method on the provider instance.
