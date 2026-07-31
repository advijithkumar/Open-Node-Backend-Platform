# Users Module

Official identity and profile management module for the Open Node Backend Platform (ONBP). This module coordinates profile settings, soft deletion, and user statuses, while delegating core credentials validation to the Better Auth plugin.

## API Endpoints
All endpoints are prefix-mounted under `/api/v1/users`:
- `GET /` - Retrieve all users (supports `limit` and `offset` query params).
- `GET /:id` - Retrieve user profile by ID.
- `POST /` - Create a user profile (verifies unique email constraints).
- `PUT /:id` - Update user profile.
- `DELETE /:id` - Soft delete user profile.
- `PATCH /:id/restore` - Restore a soft deleted user.

## Database Schema
Table: `users`
- `id` (uuid, primary key)
- `authUserId` (varchar, references `users.id` cascade, unique)
- `firstName` (varchar, not null)
- `lastName` (varchar, not null)
- `username` (varchar, unique, not null)
- `email` (varchar, unique, not null)
- `isActive` (boolean)
- `version` (integer)
- `createdAt`, `updatedAt`, `deletedAt` (timestamps)

## Events Published
Emitted through the central `EventBus`:
- `user.created` - Emitted with the created user profile record.
- `user.updated` - Emitted with the updated user profile record.
- `user.deleted` - Emitted with the soft deleted user profile record.
- `user.restored` - Emitted with the restored user profile record.

## Example Integration
```typescript
import { container } from "../../core/container/container.js";

const service = container.resolve<any>("userService");
const profile = await service.getUserById("some-user-id");
```
