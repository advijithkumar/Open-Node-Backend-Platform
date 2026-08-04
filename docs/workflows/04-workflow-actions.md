# Workflow Actions

Actions are the core units of execution in a workflow. They map direct domain operations onto ONBP platform services.

## Built-in Actions
- **`sendEmail`**: Executes `EmailService.send`.
- **`sendNotification`**: Executes `NotificationService.send`.
- **`queueJob`**: Executes `QueueManager.enqueue`.
- **`generateAI`**: Executes `AIService.complete`.
- **`dbWrite`**: Executes ORM queries using PostgreSQL.

## Custom Actions
Developers can register custom actions conforming to the `IWorkflowAction` interface:
```typescript
export interface IWorkflowAction {
  readonly name: string;
  execute(context: Record<string, any>, params?: any): Promise<any>;
}
```
