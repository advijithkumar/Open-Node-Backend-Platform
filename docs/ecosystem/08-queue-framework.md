# ONBP Platform Queue Framework Standards

The ONBP Queue Framework provides a generic queue layer abstraction supporting multiple providers (Memory, Redis) and dynamic provider switching, health checking, diagnostics reporting, and EventBus integration.

## Queue Contract
The central `IQueueService` and `IQueueProvider` contracts support:
- `createQueue(name)` - Create queue.
- `deleteQueue(name)` - Delete queue.
- `enqueue(queue, job, options?)` - Push a job onto a queue.
- `dequeue(queue)` - Pop a job from a queue.
- `process(queue, handler)` - Register handler loop for queue.
- `pause(queue)` - Pause queue execution.
- `resume(queue)` - Resume queue execution.
- `retry(jobId)` - Retry a failed job.
- `remove(jobId)` - Remove job.
- `getJob(jobId)` - Retrieve job by ID.
- `getQueueStats(queue)` - Fetch stats (pending, processing, completed, failed).

## Provider Switching & Fallback

By default, QueueManager uses the `MemoryQueueService`. If the Redis Plugin is enabled and booted successfully:
1. It registers `RedisQueueProvider` under name `"redis"`.
2. It switches the active provider to `"redis"`.

## Domain Events Published
Every queue operation triggers asynchronous event publication via `EventBus`:
- `queue.created` - Emitted on queue creations.
- `queue.deleted` - Emitted on queue deletions.
- `job.enqueued` - Emitted when job is enqueued.
- `job.started` - Emitted when handler starts processing job.
- `job.completed` - Emitted on job completion success.
- `job.failed` - Emitted on job execution errors.
- `job.retried` - Emitted on job retry schedules.

## Usage Examples

Resolve `queue` singleton:
```typescript
import { container } from "../../core/container/index.js";

const queue = container.resolve<any>("queue");

// Enqueue job
const job = await queue.enqueue("notifications", { email: "user@example.com", body: "Welcome!" });

// Register queue worker
queue.process("notifications", async (job) => {
  await sendEmail(job.data.email, job.data.body);
});
```
