# ONBP Testing Standards

This document establishes the testing requirements for all officially supported ecosystem plugins and providers in the Open Node Backend Platform (ONBP).

## 1. Required Unit Tests
Every plugin/provider package must contain unit tests covering:
- **Metadata**: Assert that the plugin has a valid `name`, `version`, and exports its provider.
- **DI Registration**: Assert that the database client is correctly registered in the dependency injection container.
- **Lifecycles**: Verify that `boot()` establishes connections and `shutdown()` cleans them up.
- **Diagnostics**: Assert that diagnostic parameters match configuration settings.
- **Error Scenarios**: Verify that connection timeouts, authentication failures, and bad queries fail gracefully, throw cleanly, and set the appropriate `enabled: false` states.

## 2. Integration Tests
- Verify that the module/plugin can be loaded dynamically via `PluginLoader` or `ModuleLoader`.
- Test that the framework boots cleanly with the plugin registered and is reported in `DiscoveryService`.

## 3. Mocking Strategy
- **Client Mocking**: To avoid Vitest hoisting cache issues, do not use unstable module-level mocks. Instead, expose a client injection setter (e.g. `provider.setClient(mockSql)`) on the provider.
- Injected mock clients should be standard spies (e.g. `vi.fn().mockImplementation(...)`) to verify query execution counts.

## 4. Coverage Expectations
- 100% of the plugin and provider source files must be covered by tests.
- All core branching logic (success and failure connection paths) must have associated test cases.

## 5. Test Naming Conventions
- Test files must be placed under `tests/unit/plugins/<name>.test.ts`.
- Use descriptive nested describe/it blocks:
  - `describe("<Name> Plugin & Provider", ...)`
  - `it("should have correct metadata and defaults", ...)`
  - `it("should fail gracefully on boot connection error", ...)`
