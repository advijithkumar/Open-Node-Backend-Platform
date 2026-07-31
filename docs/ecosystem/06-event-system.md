# ONBP Platform Event System Standards

The ONBP Event System provides a generic, decoupled event-driven routing architecture allowing modules and plugins to interact asynchronously.

## ONBPEvent Structure
Every event publication contains:
- `id`: unique UUID.
- `name`: string name of the event (e.g. `users.created`).
- `source`: publisher context name.
- `timestamp`: publication Date.
- `payload`: typed data payload.
- `correlationId`: optional ID for tracing.
- `version`: version of the event schema.

## Publishing & Subscribing

To publish an event synchronously (awaiting matching handlers sequentially):
```typescript
import { container } from "../../core/container/index.js";
import { CORE_SERVICES } from "../../core/container/service.constants.js";

const eventBus = container.resolve<any>(CORE_SERVICES.EVENT_BUS);

await eventBus.publish({
  id: crypto.randomUUID(),
  name: "user.created",
  source: "users-module",
  timestamp: new Date(),
  payload: { userId: "1" },
  version: "1.0.0"
});
```

To trigger matching handlers in the background asynchronously without blocking:
```typescript
eventBus.publishAsync(event);
```

To listen/subscribe:
```typescript
eventBus.subscribe("user.created", async (event) => {
  // Handle event
});
```
