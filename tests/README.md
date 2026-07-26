# ONBP Test Suite

This directory contains the core framework unit and integration tests.

## Structure
- **unit/**: Contains unit tests validating individual managers, services, and classes in isolation.
- **integration/**: Contains integration tests verifying container registration, module booting, plugin sorting, and discovery.

## Running Tests

To run the complete test suite:

```bash
pnpm test
```

To run tests in watch mode:

```bash
npx vitest
```

## Guidelines
- Keep tests isolated.
- Clean up any temporary filesystem directories created during tests.
- Avoid using shared global state.
