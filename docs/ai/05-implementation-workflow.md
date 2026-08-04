# Implementation Workflow

Follow this sequence for implementing features in ONBP:

```text
  ┌──────────────────────────────────────────────┐
  │         1. Parse & Understand Goal           │
  └──────────────────────┬───────────────────────┘
                         ▼
  ┌──────────────────────────────────────────────┐
  │      2. Map to existing ONBP components      │
  └──────────────────────┬───────────────────────┘
                         ▼
  ┌──────────────────────────────────────────────┐
  │     3. Define/Configure environment keys      │
  └──────────────────────┬───────────────────────┘
                         ▼
  ┌──────────────────────────────────────────────┐
  │   4. Implement domain code/register module   │
  └──────────────────────┬───────────────────────┘
                         ▼
  ┌──────────────────────────────────────────────┐
  │       5. Write Unit & Integration tests      │
  └──────────────────────┬───────────────────────┘
                         ▼
  ┌──────────────────────────────────────────────┐
  │   6. Run build, tests, and framework doctor  │
  └──────────────────────────────────────────────┘
```

## Step Checklist
- Check if environment vars need to be registered in `env.ts`.
- Expose your service through `register-core.ts` DI Container.
- Keep domain modules under `apps/api/src/modules/`.
- Ensure tests verify both successes and failure modes without requiring external APIs.
- Validate health checks and CLI diagnostics outputs.
