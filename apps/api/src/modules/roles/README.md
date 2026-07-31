# Roles Module

Official Role capability management module for the Open Node Backend Platform (ONBP). This module coordinates role configuration, system-level protect flags in RBAC scopes, and handles permission assignments.

## API Endpoints
All endpoints are prefix-mounted under `/api/v1/roles`:
- `GET /` - Retrieve all roles (supports `limit` and `offset` query params).
- `GET /:id` - Retrieve role definition by ID.
- `POST /` - Create a role definition (verifies unique name/slug constraints).
- `PUT /:id` - Update role description.
- `DELETE /:id` - Soft delete custom role (system roles are protected and cannot be deleted).
- `PATCH /:id/restore` - Restore a soft deleted role.

### Role-Permission Assignments
- `GET /:roleId/permissions` - List permissions assigned to a role.
- `POST /:roleId/permissions` - Assign a permission to a role (body: `{ permissionId: string }`).
- `PUT /:roleId/permissions` - Replace all permissions for a role (body: `{ permissionIds: string[] }`).
- `DELETE /:roleId/permissions/:permissionId` - Remove a permission from a role.

## Database Schema
Table: `roles`
- `id` (uuid, primary key)
- `name` (varchar, unique, not null)
- `slug` (varchar, unique, not null)
- `description` (varchar, optional)
- `isSystem` (boolean)
- `isActive` (boolean)
- `version` (integer)
- `createdAt`, `updatedAt`, `deletedAt` (timestamps)

## Events Published
Emitted through the central `EventBus`:
- `role.created` - Emitted with the created role definition record.
- `role.updated` - Emitted with the updated role definition record.
- `role.deleted` - Emitted with the soft deleted role definition record.
- `role.restored` - Emitted with the restored role definition record.
- `role.permissionAssigned` - Emitted with payload `{ roleId, permissionId }`.
- `role.permissionRemoved` - Emitted with payload `{ roleId, permissionId }`.
- `role.permissionsReplaced` - Emitted with payload `{ roleId, permissionIds }`.

## Example Integration
```typescript
import { container } from "../../core/container/container.js";

const service = container.resolve<any>("roleService");
const role = await service.getRoleById("some-role-id");
```
