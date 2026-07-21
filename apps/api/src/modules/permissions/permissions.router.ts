import { Router, type Request, type Response } from "express";
import { z } from "zod";
import type { PermissionService } from "./permissions.service.js";
import { successResponse } from "../../core/responses/success-response.js";
import { createdResponse } from "../../core/responses/created-response.js";
import { noContentResponse } from "../../core/responses/no-content-response.js";
import { validate } from "../../core/validation/validate.js";
import { asyncHandler } from "../../core/utils/async-handler.js";

const createPermissionSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(150),
    slug: z.string().min(1).max(150),
    resource: z.string().min(1).max(100),
    action: z.enum(["create", "read", "update", "delete", "manage"]),
    description: z.string().optional(),
  }),
});

const updatePermissionSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(150).optional(),
    description: z.string().optional(),
  }),
});

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
      const permission = await permissionService.getPermissionById(req.params.id as string);
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
      const permission = await permissionService.updatePermission(req.params.id as string, req.body);
      successResponse(res, { data: permission, message: "Permission updated successfully" });
    })
  );

  router.delete(
    "/:id",
    asyncHandler(async (req: Request, res: Response) => {
      await permissionService.deletePermission(req.params.id as string);
      noContentResponse(res);
    })
  );

  return router;
}
