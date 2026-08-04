# Reuse-First Rules

To prevent code bloating and duplication, developers and AI coding agents must adhere to the reuse rules defined below.

## The Core Mandate
> **Before writing a new service, database adapter, helper, or middleware, you MUST search the codebase to identify whether an ONBP abstraction already provides that capability.**

---

## Code Redundancy Safeguards

### Rule 1: No direct connections
- Do NOT open custom SMTP connections (`nodemailer`), S3 client pools (`minio`), or Redis connections (`ioredis`) directly inside business modules.
- Use `EmailService`, `StorageService`, and `CacheService` via the dependency container.

### Rule 2: Keep ORM Clean
- Do NOT create separate PostgreSQL connection pools using `pg` or `slqite3` libraries. All database queries must run through the central `db` client resolved from the Drizzle configuration.

### Rule 3: Leverage RBAC
- Do NOT write custom tables or middlewares to verify user permissions. Load the `permissions` and `roles` modules and apply the `AuthorizationService` middleware checks.

### Rule 4: Orchestrate with Workflows
- Do NOT implement manual execution loops, nested callback promises, or custom step graph/DAG models to coordinate multi-step business logic pipelines.
- Register custom step actions (`IWorkflowStep`) and coordinate them using `WorkflowService`.
