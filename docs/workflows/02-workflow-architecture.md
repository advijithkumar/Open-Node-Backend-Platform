# Workflow Framework Architecture

The workflow framework sits on top of the frozen Core infrastructure layer. It coordinates business components and platform services without introducing competing container or lifecycle managers.

## Component Stack
```text
  Client / API / Event Trigger
               ↓
        WorkflowEngine
               ↓
    ┌─────────────────────┐
    │  Workflow Instance  │
    └─────────────────────┘
       /       |       \
  Step 1    Step 2    Step 3 (Conditional)
    │          │          │
  Action     Action     Action
  (Email)     (AI)     (Queue)
```

- **`WorkflowEngine`**: The core execution runner managing state, context validation, and action dispatching.
- **Workflow State**: Execution context passed across steps storing output returns from prior actions.
- **Dependency Isolation**: All step actions resolve dependencies using the central `container` from the kernel.
