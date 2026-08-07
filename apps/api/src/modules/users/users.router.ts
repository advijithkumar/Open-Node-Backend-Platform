import { Router, type Request, type Response } from "express";
import type { UserService } from "./users.service.js";
import { successResponse } from "../../core/responses/success-response.js";
import { createdResponse } from "../../core/responses/created-response.js";
import { noContentResponse } from "../../core/responses/no-content-response.js";
import { validate } from "../../core/validation/validate.js";
import { asyncHandler } from "../../core/utils/async-handler.js";
import { createUserSchema, updateUserSchema } from "./users.validation.js";
import { requireAuth } from "../../core/auth/auth.middleware.js";

export function createUsersRouter(userService: UserService): Router {
  const router = Router();

  router.get(
    "/",
    requireAuth(),
    asyncHandler(async (req: Request, res: Response) => {
      const limit = Number(req.query.limit) || 20;
      const offset = Number(req.query.offset) || 0;
      const users = await userService.getUsers(limit, offset);
      successResponse(res, { data: users, message: "Users retrieved successfully" });
    })
  );

  router.get(
    "/:id",
    requireAuth(),
    asyncHandler(async (req: Request, res: Response) => {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const user = await userService.getUserById(id);
      successResponse(res, { data: user });
    })
  );

  router.post(
    "/",
    requireAuth(),
    validate(createUserSchema),
    asyncHandler(async (req: Request, res: Response) => {
      const user = await userService.createUser(req.body);
      createdResponse(res, { data: user, message: "User created successfully" });
    })
  );

  router.put(
    "/:id",
    requireAuth(),
    validate(updateUserSchema),
    asyncHandler(async (req: Request, res: Response) => {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const updated = await userService.updateUser(id, req.body);
      successResponse(res, { data: updated, message: "User updated successfully" });
    })
  );

  router.delete(
    "/:id",
    requireAuth(),
    asyncHandler(async (req: Request, res: Response) => {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      await userService.deleteUser(id);
      noContentResponse(res);
    })
  );

  router.patch(
    "/:id/restore",
    requireAuth(),
    asyncHandler(async (req: Request, res: Response) => {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const restored = await userService.restoreUser(id);
      successResponse(res, { data: restored, message: "User restored successfully" });
    })
  );

  return router;
}
export default createUsersRouter;
