# ONBP AI Coding Agents Entrypoint

Welcome to the **Open Node Backend Platform (ONBP)**. This document is your mandatory entry point. Read this file in full before editing any code.

---

## 1. What is ONBP?
ONBP is a production-ready, open-source backend platform built with Node.js, TypeScript, Express, PostgreSQL, and Docker. It provides frozen, robust core frameworks and services to minimize development overhead.

---

## 2. Golden Rules

1. **Read AGENTS.md** before implementing any feature or modifying code.
2. **Consult `onbp.manifest.json` and `onbp.ai.json`** to locate appropriate guidelines.
3. **Parse `onbp.capabilities.json`** to check if the required component already exists.
4. **Inspect `onbp.versions.json`** to ensure your packages conform to approved versions.
5. **Reuse before Rebuilding**: Reuse existing core abstractions (Cache, Storage, Queue, Email, Notification, AI, Workflow) instead of writing custom alternatives.
6. **Bypass Forbidden**: Never bypass framework services to call direct SDKs or custom filesystem writes unless architecturally justified and approved.
7. **Follow ADRs**: Observe Architecture Decision Records (`docs/adr/`).
8. **Framework Freeze**: Do NOT modify frozen core directories (e.g. `src/core/kernel/`, `src/core/container/`) under ADR-002.
9. **Verify Code**: Always run the build, unit/integration tests, and linter after writing code.
10. **Run Doctor**: Execute `pnpm run onbp doctor` to verify health.

---

## 3. Repository Orientation

- **`apps/api/src/core/`**: Abstractions and managers for platform services (storage, cache, queue, scheduler, notifications, email, AI).
- **`apps/api/src/plugins/`**: Integrations with external vendors/databases (MinIO, Redis, Better Auth).
- **`apps/api/src/modules/`**: Business modules containing Express routers, models, controllers, and services (Users, Roles, Permissions).
- **`apps/api/src/providers/`**: Service providers mapping interfaces to drivers (SmtpEmailProvider, MockAIProvider).
- **`apps/api/src/bootstrap/`**: Kernel registration and service container setup.
- **`apps/api/src/cli/`**: CommandLine Interface for `discovery` and `doctor` commands.
- **`docs/`**: Human-readable architecture plans and technology manuals.
- **`tests/`**: Unit and integration test suites.

---

## 4. Implementation Workflow

```text
Understand requirement
       ↓
Search existing capability (onbp.capabilities.json)
       ↓
Select ONBP abstraction (e.g. EmailService)
       ↓
Check technology versions (onbp.versions.json)
       ↓
Implement within existing convention (core, module, plugin, provider)
       ↓
Write automated mock tests
       ↓
Run build, test, and lint pipelines
       ↓
Execute Framework Doctor (onbp doctor)
```
