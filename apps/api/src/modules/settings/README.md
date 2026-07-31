# Settings Module

Official settings management capability module for the Open Node Backend Platform (ONBP). This module manages business settings, application preferences, feature flags, and editable values stored in the database.

## API Endpoints
All endpoints are prefix-mounted under `/api/v1/settings`:
- `GET /` - Retrieve all settings (supports `limit` and `offset` query params).
- `GET /:key` - Retrieve setting by unique key name.
- `POST /` - Create setting (validates duplicate key existence).
- `PUT /:key` - Update setting value/description.
- `DELETE /:key` - Soft delete setting.

## Configuration distinction
- **ConfigManager**: Manages read-only infrastructure and environment configuration.
- **Settings Module**: Manages editable runtime application and business preferences in the database.

## Database Schema
Table: `settings`
- `id` (uuid, primary key)
- `key` (varchar, unique, not null)
- `value` (varchar, not null)
- `description` (varchar, optional)
- `isActive` (boolean)
- `version` (integer)
- `createdAt`, `updatedAt`, `deletedAt` (auditing timestamps)

## Events Published
Emitted through the central `EventBus`:
- `setting.created` - Emitted with the created setting record.
- `setting.updated` - Emitted with the updated setting record.
- `setting.deleted` - Emitted with the deleted setting record.

## Example Integration
```typescript
import { container } from "../../core/container/container.js";

const service = container.resolve<any>("settingsService");
const val = await service.findByKey("my.business.pref");
```
