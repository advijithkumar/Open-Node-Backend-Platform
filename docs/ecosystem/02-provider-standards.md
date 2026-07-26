# ONBP Provider Quality Standard

This document details the responsibilities, health checks, and connection management rules for ONBP ecosystem providers.

## 1. Provider Responsibilities
Providers act as the concrete bridge between third-party client drivers (PostgreSQL, Redis, MinIO) and the ONBP Core Framework. They encapsulate connection pooling, queries, and client instantiations.

## 2. Health Reporting
- Implement `health(): Promise<Record<string, unknown>>`.
- Execute a lightweight ping query (e.g. `SELECT 1` for SQL databases, `PING` for Redis).
- Return `{ status: "healthy" }` or `{ status: "unhealthy", reason: message }`.

## 3. Diagnostics
- Implement `diagnostics()`.
- Return configuration parameters, enabled flags, connection health indicators, and pool limits.
- Avoid exposing passwords, secret keys, or authentication tokens.

## 4. Connection Lifecycle
- **Instantiation**: Lazy-loaded. Drivers are not constructed during `register()`.
- **Boot**: Instantiated and verified during the `boot()` lifecycle phase.
- **Graceful Shutdown**: Implement `shutdown()`. Close connection pools cleanly (e.g. `client.end()`).

## 5. Configuration Access
- Always fetch config variables via getter properties in `config.ts` which retrieve from `ConfigManager`.

## 6. Error Translation
- Catch driver exceptions. Wrap with context, and throw a standard `Error` containing the caught exception inside the `{ cause }` option parameter.
- Ensure the error messages are clear and actionable (e.g., pointing to missing configurations or refused ports).

## 7. Dependency Injection Rules
- Plugins must register the client returned by the provider under a standardized constant key in the container (e.g. `postgresqlClient`).
- Use factory registration to defer resolution until the client has booted successfully:
  ```typescript
  container.registerSingleton("clientKey", () => provider.getClient());
  ```
