# Workflow Step Guide

Steps execute concrete operations by calling platform services resolved from the DI container.

## 1. Creating a Step Action
Implement the `IWorkflowStep` interface:
```typescript
import { IWorkflowStep, WorkflowContext } from "../workflow/index.js";
import { container } from "../container/container.js";
import { CORE_SERVICES } from "../container/service.constants.js";

export class SendWelcomeEmailStep implements IWorkflowStep {
  readonly name = "sendWelcomeEmail";

  async execute(context: WorkflowContext, input: any): Promise<any> {
    const emailService = container.resolve<any>(CORE_SERVICES.EMAIL);
    const toAddress = input.email || context.input.email;

    return await emailService.send({
      to: toAddress,
      subject: "Welcome to ONBP!",
      text: "Thanks for registering."
    });
  }
}
```

## 2. Setting Retries and Timeouts
Add configuration directly inside step definitions:
```json
{
  "name": "email-step",
  "action": "sendWelcomeEmail",
  "timeout": 5000,
  "retry": {
    "attempts": 3,
    "delay": 1000
  }
}
```
