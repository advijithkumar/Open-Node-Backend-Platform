# Architecture Decision Record 003: ONBP v0.1 Alpha Scope

## Status
Accepted

## Date
2026-07-26

---

## Context
To prevent feature creep and establish a clear target for the first public release of the Open Node Backend Platform (ONBP), we must define the exact scope of the ONBP v0.1 Alpha version. 

---

## Decision
We define the scope of the ONBP v0.1 Alpha release as follows. Any features not listed here are deferred to subsequent releases.

### 1. Core Framework (Included)
- Dependency Injection Container
- Kernel
- Module System
- Plugin System
- Provider System
- Lifecycle
- Event Bus
- Discovery
- Configuration Manager
- Health Manager
- CLI and Code Generators
- Dynamic Module Loader
- Dynamic Plugin Loader

### 2. Official Plugins (Included)
- PostgreSQL
- Redis
- MinIO
- Better Auth

### 3. Official Business Modules (Included)
- Settings
- Users
- Roles
- Permissions
- Audit

### 4. Documentation (Included)
- Core Architecture Architecture Decision Records (ADRs)
- Ecosystem Development Standards (Plugin, Provider, and Testing Standards)

### 5. Testing (Included)
- Complete unit and integration test coverage for core components and Alpha plugins.

---

## Explicitly Excluded
The following architectural capabilities are explicitly deferred:
- Kubernetes and Docker Swarm support
- AI, Mail, Queue, and Scheduler providers
- Multi-tenancy and microservice orchestration
- GraphQL, Event Sourcing, and CQRS
- Distributed cache and multi-database replication

---

## Success Criteria
ONBP v0.1 Alpha is considered complete and ready when:
1. Core framework is frozen under ADR-002.
2. All alpha plugins and business modules are production-ready.
3. Ecosystem and architectural documentation is complete.
4. All unit and integration test suites pass successfully.
5. A reference application (STOMP) can be built entirely using the ecosystem and framework capabilities.
