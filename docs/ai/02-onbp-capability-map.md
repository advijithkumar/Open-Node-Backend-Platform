# ONBP Capability Map

This document describes all capabilities provided by the ONBP core platform.

## Framework Core
- **Kernel**: Orchestrates core boot lifecycle.
- **Container**: Inversion of Control (IoC) DI registry.
- **ConfigManager**: Central configuration store loader.
- **Discovery**: Exposes platform runtime diagnostics.
- **Events**: Handles inter-module event signals.
- **Doctor**: Runs framework validation tests.

## Security & Auth
- **Better Auth**: Handles sessions, passwords, and tokens.
- **RBAC**: Modules for Users, Roles, Permissions, and Authorization checks.

## Infrastructure & Persistence
- **PostgreSQL**: Primary SQL persistence via Drizzle ORM.
- **Redis**: Caching and background queue backend store.
- **MinIO**: High-performance S3 object storage provider.

## Services
- **Cache**: Provider-agnostic caching interface.
- **Queue**: Background task execution processor.
- **Scheduler**: Periodic task executor.
- **Notification**: Unified in-app, push, and SMS interface.
- **Email**: Dedicated SMTP and transactional mail framework.
- **AI**: Completion and embeddings model interface.
- **Workflow**: Composes and runs multi-step platform workflows.
