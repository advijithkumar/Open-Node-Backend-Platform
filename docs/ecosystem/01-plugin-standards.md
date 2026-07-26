# ONBP Plugin Quality Standard

This document defines the quality standards that every officially supported plugin in the Open Node Backend Platform (ONBP) ecosystem must follow.

## 1. Standard Folder Layout
Every plugin must follow a strict, flat structure:
```text
postgresql/
├── index.ts      # Default exports the constructed plugin instance
├── plugin.ts     # Implements the IPlugin interface and resolves DI bindings
├── provider.ts   # Wraps third-party drivers to implement the IProvider interface
├── config.ts     # Dynamic property getters resolved only from ConfigManager
├── constants.ts  # Declares default ports and DI container keys
├── types.ts      # Plugin configuration interfaces and types
└── README.md     # Setup, registration, configuration, and troubleshooting documentation
```

## 2. Lifecycle
Plugins must correctly register services, boot, and shutdown:
- **`register(container)`**: Bind services/adapters to the dependency injection container. This phase must be synchronous or return a Promise. Direct connection attempts are **forbidden** here.
- **`boot()`**: Initialize connection pools and verify server reachability.
- **`shutdown()`**: Gracefully end database connection pools or client listeners.

## 3. Configuration
- Plugins must **never** reference `process.env` directly.
- All configurations must be read through the central `ConfigManager`.
- Fallbacks and defaults must be defined inside `config.ts` (e.g. standard ports).

## 4. Provider requirements
- If the plugin exposes external connections or adapters, it must wrap them inside a class implementing `IProvider`.
- Expose health reporting, diagnostics, and connection status.

## 5. Discovery Integration
- Ensure `DiscoveryService` diagnostics map properties to human-readable outputs.
- Providers must implement `diagnostics()` / `getDiagnostics()` exposing connection pools details (e.g., active counts).

## 6. Logging Standards
- Use the framework's core logger.
- Log errors using `logger.error` during connection failures, and `logger.info` for successful bootstraps.

## 7. Error Handling
- Never throw raw driver-specific stack traces.
- Catch library errors, wrap them with a clear message and append the original error to the `{ cause }` option of the new error constructor.

## 8. Testing Requirements
- Mock external network packages to ensure tests are deterministic.
- Assert metadata, successful registration, and custom error scenario recoveries.
