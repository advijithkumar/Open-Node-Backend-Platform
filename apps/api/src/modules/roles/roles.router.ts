import { Router, type Request, type Response } from "express";
import type { RoleService } from "./roles.service.js";
import { successResponse } from "../../core/responses/success-response.js";
import { createdResponse } from "../../core/responses/created-response.js";
import { noContentResponse } from "../../core/responses/no-content-response.js";
import { validate } from "../../core/validation/validate.js";
import { asyncHandler } from "../../core/utils/async-handler.js";
import { createRoleSchema, updateRoleSchema, assignPermissionSchema, replacePermissionsSchema } from "./roles.validation.js";
import { requireAuth } from "../../core/auth/auth.middleware.js";

export function createRolesRouter(roleService: RoleService): Router {
  const router = Router();

  router.use(requireAuth());

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
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const role = await roleService.getRoleById(id);
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
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const role = await roleService.updateRole(id, req.body);
      successResponse(res, { data: role, message: "Role updated successfully" });
    })
  );

  router.delete(
    "/:id",
    asyncHandler(async (req: Request, res: Response) => {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      await roleService.deleteRole(id);
      noContentResponse(res);
    })
  );

  router.patch(
    "/:id/restore",
    asyncHandler(async (req: Request, res: Response) => {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const restored = await roleService.restoreRole(id);
      successResponse(res, { data: restored, message: "Role restored successfully" });
    })
  );

  // Junction relationship REST endpoints
  router.get(
    "/:roleId/permissions",
    asyncHandler(async (req: Request, res: Response) => {
      const roleId = Array.isArray(req.params.roleId) ? req.params.roleId[0] : req.params.roleId;
      const permissions = await roleService.getRolePermissions(roleId);
      successResponse(res, { data: permissions, message: "Role permissions retrieved successfully" });
    })
  );

  router.post(
    "/:roleId/permissions",
    validate(assignPermissionSchema),
    asyncHandler(async (req: Request, res: Response) => {
      const roleId = Array.isArray(req.params.roleId) ? req.params.roleId[0] : req.params.roleId;
      const { permissionId } = req.body;
      await roleService.assignPermissionToRole(roleId, permissionId);
      successResponse(res, { message: "Permission assigned to role successfully" });
    })
  );

  router.put(
    "/:roleId/permissions",
    validate(replacePermissionsSchema),
    asyncHandler(async (req: Request, res: Response) => {
      const roleId = Array.isArray(req.params.roleId) ? req.params.roleId[0] : req.params.roleId;
      const { permissionIds } = req.body;
      await roleService.replaceRolePermissions(roleId, permissionIds);
      successResponse(res, { message: "Role permissions replaced successfully" });
    })
  );

  router.delete(
    "/:roleId/permissions/:permissionId",
    asyncHandler(async (req: Request, res: Response) => {
      const roleId = Array.isArray(req.params.roleId) ? req.params.roleId[0] : req.params.roleId;
      const permissionId = Array.isArray(req.params.permissionId) ? req.params.permissionId[0] : req.params.permissionId;
      await roleService.removePermissionFromRole(roleId, permissionId);
      noContentResponse(res);
    })
  );

  return router;
}
export default createRolesRouter;
