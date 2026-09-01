# UsersModule Module

Scaffolded automatically by the ONBP CLI.

## Description
This module provides the business logic, storage, and endpoints for managing `users-module`.

## Responsibilities
- Coordinates the service and repository layers for `users-module`.
- Validates requests via Zod.
- Emits events when `users-module` resources change.

## API Endpoints
- `GET /api/v1/users-module` - Retrieve all `users-module` items.
- `POST /api/v1/users-module` - Create a new `users-module` item.

## Events Published
- `users-module.created` - Emitted when a new resource is created.
