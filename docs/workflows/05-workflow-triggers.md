# Workflow Triggers

Triggers are entry points that initiate workflow executions.

## Trigger Types
1. **API Trigger**: Express endpoint requests executing the engine.
2. **Event Trigger**: Listens for specific EventBus signals (e.g. `user.registered`, `order.created`) and kicks off execution.
3. **Scheduler Trigger**: Executed periodically using the `SchedulerService`.
