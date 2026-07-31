import { Router, type Request, type Response } from "express";
import type { PermissionService } from "./permissions.service.js";
import { successResponse } from "../../core/responses/success-response.js";
import { createdResponse } from "../../core/responses/created-response.js";
import { noContentResponse } from "../../core/responses/no-content-response.js";
import { validate } from "../../core/validation/validate.js";
import { asyncHandler } from "../../core/utils/async-handler.js";
import { createPermissionSchema, updatePermissionSchema } from "./permissions.validation.js";
import { container } from "../../core/container/container.js";

export function createPermissionsRouter(permissionService: PermissionService): Router {
  const router = Router();

  router.get(
    "/",
    asyncHandler(async (req: Request, res: Response) => {
      const limit = Number(req.query.limit) || 100;
      const offset = Number(req.query.offset) || 0;
      const permissions = await permissionService.getPermissions(limit, offset);
      successResponse(res, { data: permissions, message: "Permissions retrieved successfully" });
    })
  );

  router.get(
    "/:id",
    asyncHandler(async (req: Request, res: Response) => {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const permission = await permissionService.getPermissionById(id);
      successResponse(res, { data: permission });
    })
  );

  router.post(
    "/",
    validate(createPermissionSchema),
    asyncHandler(async (req: Request, res: Response) => {
      const permission = await permissionService.createPermission(req.body);
      createdResponse(res, { data: permission, message: "Permission created successfully" });
    })
  );

  router.put(
    "/:id",
    validate(updatePermissionSchema),
    asyncHandler(async (req: Request, res: Response) => {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const permission = await permissionService.updatePermission(id, req.body);
      successResponse(res, { data: permission, message: "Permission updated successfully" });
    })
  );

  router.delete(
    "/:id",
    asyncHandler(async (req: Request, res: Response) => {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      await permissionService.deletePermission(id);
      noContentResponse(res);
    })
  );

  router.patch(
    "/:id/restore",
    asyncHandler(async (req: Request, res: Response) => {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const restored = await permissionService.restorePermission(id);
      successResponse(res, { data: restored, message: "Permission restored successfully" });
    })
  );

  // Junction relationship REST endpoint
  router.get(
    "/:permissionId/roles",
    asyncHandler(async (req: Request, res: Response) => {
      const permissionId = Array.isArray(req.params.permissionId) ? req.params.permissionId[0] : req.params.permissionId;
      const roleService = container.resolve<any>("roleService");
      const rolesList = await roleService.getPermissionRoles(permissionId);
      successResponse(res, { data: rolesList, message: "Permission roles retrieved successfully" });
    })
  );

  return router;
}
export default createPermissionsRouter;
