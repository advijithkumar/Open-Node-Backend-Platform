# Workflow Framework (Phase 1)

The ONBP Workflow Framework provides a lightweight, provider-agnostic engine designed to orchestrate existing platform services into deterministic sequential workflows.

## What it is
- **An Orchestrator**: Coordinates tasks executing through pre-existing modules and services (Email, AI, Storage, notifications).
- **A Sequential DAG Pipeline**: Runs steps in order after verifying dependencies are resolved and topological ordering completes.
- **A Validation Check**: Asserts that duplicate step names, missing prerequisites, or circular references are caught before execution start.

## What it is NOT
- **Not a Background Job Queue**: It does not replace the Queue Framework. Workflows coordinate jobs, whereas Queue manages execution pools.
- **Not a Cron Scheduler**: Scheduling belongs to `SchedulerService`. Workflows are invoked via triggers.
- **Not an Event Publisher**: The EventBus handles decoupled messaging. Workflows emit signals to it but do not replace it.
