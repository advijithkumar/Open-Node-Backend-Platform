# ONBP Authorization Ecosystem Standards

The ONBP platform provides a core caching-enabled, role-hierarchy-based Authorization layer using `AuthorizationService` and Express middleware guards.

## Architecture & Flows

### Role Flow
Role authorization checks are hierarchy-aware. Under the default hierarchy:
- `super-admin` inherits `admin`, `manager`, `employee`, `guest`.
- `admin` inherits `manager`, `employee`, `guest`.
- `manager` inherits `employee`, `guest`.
- `employee` inherits `guest`.

When `requireRole("manager")` is evaluated:
1. Resolves user role slug from session.
2. Checks if user role is equal to or inherits `manager`.
3. Permits or raises `403 FORBIDDEN` AppError.

### Permission Flow
Permission authorization checks are cache-optimized:
1. Evaluates wildcard access (e.g. `super-admin` bypasses checks).
2. Looks up `user:${userId}:permissions` in Cache service.
3. On cache miss, queries database junction mapping to aggregate permissions for the user's role, and caches list with a 5-minute TTL.
4. Validates if list includes the required permission name.

## Guard Middleware Usage

To secure module routes, attach the appropriate middleware guard:

```typescript
import { Router } from "express";
import { requireAuth, requireRole, requirePermission } from "../../core/auth/index.js";

const router = Router();

// 1. Requires only active authentication session
router.get("/profile", requireAuth(), (req, res) => { ... });

// 2. Requires specific role (or higher in hierarchy)
router.post("/refund", requireAuth(), requireRole("manager"), (req, res) => { ... });

// 3. Requires granular capability permission
router.put("/users/:id", requireAuth(), requirePermission("users.update"), (req, res) => { ... });
```
