# Workflow Development Guide

Learn how to write and register new workflows inside the ONBP application ecosystem.

## 1. Defining a Workflow
A workflow is declared as a JSON-like object conforming to `WorkflowDefinition`.

```json
{
  "name": "sample-workflow",
  "version": "1.0.0",
  "steps": [
    {
      "name": "first-step",
      "action": "doFirstAction"
    },
    {
      "name": "second-step",
      "action": "doSecondAction",
      "dependsOn": ["first-step"]
    }
  ]
}
```

## 2. Registering and Executing
Resolve the `WorkflowService` singleton from the container and register your template:
```typescript
const ws = container.resolve<WorkflowService>(CORE_SERVICES.WORKFLOW);
ws.registerWorkflow(myDefinition);

// Execute
const result = await ws.execute("sample-workflow", { userId: "user-123" });
console.log(result.status); // "completed" or "failed"
```
