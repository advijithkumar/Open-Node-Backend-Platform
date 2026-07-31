# Permissions Module

Official Permission capability management module for the Open Node Backend Platform (ONBP). This module coordinates permission configuration, system-level protect flags in RBAC scopes, and queries roles assigned to permissions.

## API Endpoints
All endpoints are prefix-mounted under `/api/v1/permissions`:
- `GET /` - Retrieve all permissions (supports `limit` and `offset` query params).
- `GET /:id` - Retrieve permission definition by ID.
- `POST /` - Create a permission definition (verifies unique name/slug constraints and lowercase slug format).
- `PUT /:id` - Update permission description.
- `DELETE /:id` - Soft delete custom permission (system permissions are protected and cannot be deleted).
- `PATCH /:id/restore` - Restore a soft deleted permission.

### Permission Role Queries
- `GET /:permissionId/roles` - Retrieve all roles containing a permission.

## Database Schema
Table: `permissions`
- `id` (uuid, primary key)
- `name` (varchar, unique, not null)
- `slug` (varchar, unique, not null)
- `resource` (varchar, not null)
- `action` (varchar, not null)
- `description` (varchar, optional)
- `isActive` (boolean)
- `version` (integer)
- `createdAt`, `updatedAt`, `deletedAt` (timestamps)

## Events Published
Emitted through the central `EventBus`:
- `permission.created` - Emitted with the created permission definition record.
- `permission.updated` - Emitted with the updated permission definition record.
- `permission.deleted` - Emitted with the soft deleted permission definition record.
- `permission.restored` - Emitted with the restored permission definition record.

## Example Usage
```typescript
import { container } from "../../core/container/container.js";

const service = container.resolve<any>("permissionService");
const perm = await service.getPermissionById("some-permission-id");
```
