# Architecture Rules & Constraints

ONBP enforces strict boundaries to keep the core codebase robust and maintainable. All development must respect these architectural limits.

## Framework Freeze (ADR-002)
- **What is frozen**: Core DI Container, Kernel, ModuleManager, PluginManager, EventBus registry.
- **Why**: Prevent regression risks on fundamental kernel bootstrap operations.
- **Where to build**: Register custom plugins under `src/plugins/`, custom providers under `src/providers/`, and business logic under `src/modules/`.

## Decoupling Mandates
- **Provider Agnostic**: Abstractions (`StorageService`, `CacheService`, `AIService`) must never import vendor SDKs directly. All specific vendor logic belongs inside provider drivers implementing the respective `I<Service>Provider` interface.
- **Dependency Injection**: Never use global variable states to access resources. Register and resolve them using the IoC container.
- **Configuration Security**: Do NOT print raw environment variable credentials, database passwords, or SMTP usernames to logs or discovery payloads. Obscure them with asterisks or filter them completely.
