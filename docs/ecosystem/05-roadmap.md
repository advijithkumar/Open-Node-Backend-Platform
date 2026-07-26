# ONBP Ecosystem Roadmap

This document outlines the scheduled release phases and checklist tracking for the official Open Node Backend Platform (ONBP) ecosystem components.

## Phase 1: Official Plugins
Plugins expand core adapters.

| Component | Status | Key Features |
| :--- | :--- | :--- |
| **PostgreSQL** | ✅ Complete | Connection pool (`postgres` package), diagnostics, ping health check. |
| **Redis** | 📅 Backlog | Cache adapter, queue broker, key expirations. |
| **MinIO** | 📅 Backlog | Storage service adapter, S3 compatibility, presigned URLs. |
| **Better Auth** | 📅 Backlog | Sessions, credentials authentication, oauth flow. |
| **Mail** | 📅 Backlog | SMTP adapter, template rendering. |
| **Queue** | 📅 Backlog | Broker connections, task retry handling. |
| **Scheduler** | 📅 Backlog | Cron intervals, task lockings. |
| **AI** | 📅 Backlog | LLM interface, embeddings, prompt generation. |

---

## Phase 2: Official Modules
Modules encapsulate reusable business domains.

| Component | Status | Target Capabilities |
| :--- | :--- | :--- |
| **Users** | 📅 Backlog | User models, registration, profiles. |
| **Roles & Permissions** | 📅 Backlog | RBAC schema, middleware checkings. |
| **Audit Log** | 📅 Backlog | Activity tracking repository. |
| **Settings** | 📅 Backlog | Dynamic system parameters. |
| **Files** | 📅 Backlog | Upload handlers, MinIO attachment links. |
| **Notifications** | 📅 Backlog | Email delivery integrations. |

---

## Phase 3: Reference Applications
Applications validate framework stability.

### STOMP (Smart Transit Operations Management Platform)
- **Status**: 📅 Backlog
- **Scope**: Bus tracking, fleet diagnostics, routing, API key auth, activity audit logs, and schedule alerts.
