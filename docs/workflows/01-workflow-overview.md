# Workflow Framework Overview

The ONBP Workflow Framework provides a clean, provider-agnostic engine designed to orchestrate platform-level infrastructure and business components. It structures complex routines into machine-readable and executable step definitions.

## Key Features
- **Deterministic Transitions**: Ensures tasks proceed sequentially or conditionally based on step action results.
- **Dependency Orchestration**: Leverages the central DI container to resolve platform services (Email, AI, Database, Cache, Queue) dynamically.
- **Asynchronous & Queued Steps**: Steps can be scheduled as background jobs running via the Queue Framework.
- **Observability**: Automatically registers execution history, step statuses, and emits lifecycle notifications to the EventBus.
