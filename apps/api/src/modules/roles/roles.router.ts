import { Router, type Request, type Response } from "express";
import { z } from "zod";
import type { RoleService } from "./roles.service.js";
import { successResponse } from "../../core/responses/success-response.js";
import { createdResponse } from "../../core/responses/created-response.js";
import { noContentResponse } from "../../core/responses/no-content-response.js";
import { validate } from "../../core/validation/validate.js";
import { asyncHandler } from "../../core/utils/async-handler.js";

const createRoleSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100),
    slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, "slug must be lowercase kebab-case"),
    description: z.string().optional(),
  }),
});

const updateRoleSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().optional(),
  }),
});

export function createRolesRouter(roleService: RoleService): Router {
  const router = Router();

  router.get(
    "/",
    asyncHandler(async (req: Request, res: Response) => {
      const limit = Number(req.query.limit) || 50;
      const offset = Number(req.query.offset) || 0;
      const roles = await roleService.getRoles(limit, offset);
      successResponse(res, { data: roles, message: "Roles retrieved successfully" });
    })
  );

  router.get(
    "/:id",
    asyncHandler(async (req: Request, res: Response) => {
      const role = await roleService.getRoleById(req.params.id as string);
      successResponse(res, { data: role });
    })
  );

  router.post(
    "/",
    validate(createRoleSchema),
    asyncHandler(async (req: Request, res: Response) => {
      const role = await roleService.createRole(req.body);
      createdResponse(res, { data: role, message: "Role created successfully" });
    })
  );

  router.put(
    "/:id",
    validate(updateRoleSchema),
    asyncHandler(async (req: Request, res: Response) => {
      const role = await roleService.updateRole(req.params.id as string, req.body);
      successResponse(res, { data: role, message: "Role updated successfully" });
    })
  );

  router.delete(
    "/:id",
    asyncHandler(async (req: Request, res: Response) => {
      await roleService.deleteRole(req.params.id as string);
      noContentResponse(res);
    })
  );

  return router;
}
