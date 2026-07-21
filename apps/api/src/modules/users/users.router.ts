import { Router, type Request, type Response } from "express";
import { z } from "zod";
import type { UserService } from "./users.service.js";
import { successResponse } from "../../core/responses/success-response.js";
import { createdResponse } from "../../core/responses/created-response.js";
import { noContentResponse } from "../../core/responses/no-content-response.js";
import { validate } from "../../core/validation/validate.js";
import { asyncHandler } from "../../core/utils/async-handler.js";

const createUserSchema = z.object({
  body: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    username: z.string().min(3),
    email: z.string().email(),
    authUserId: z.string().min(1),
  }),
});

const updateUserSchema = z.object({
  body: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    username: z.string().optional(),
    email: z.string().email().optional(),
  }),
});

export function createUsersRouter(userService: UserService): Router {
  const router = Router();

  router.get(
    "/",
    asyncHandler(async (req: Request, res: Response) => {
      const limit = Number(req.query.limit) || 20;
      const offset = Number(req.query.offset) || 0;
      const users = await userService.getUsers(limit, offset);
      successResponse(res, { data: users, message: "Users retrieved successfully" });
    })
  );

  router.get(
    "/:id",
    asyncHandler(async (req: Request, res: Response) => {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const user = await userService.getUserById(id);
      successResponse(res, { data: user });
    })
  );

  router.post(
    "/",
    validate(createUserSchema),
    asyncHandler(async (req: Request, res: Response) => {
      const user = await userService.createUser(req.body);
      createdResponse(res, { data: user, message: "User created successfully" });
    })
  );

  router.put(
    "/:id",
    validate(updateUserSchema),
    asyncHandler(async (req: Request, res: Response) => {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const updated = await userService.updateUser(id, req.body);
      successResponse(res, { data: updated, message: "User updated successfully" });
    })
  );

  router.delete(
    "/:id",
    asyncHandler(async (req: Request, res: Response) => {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      await userService.deleteUser(id);
      noContentResponse(res);
    })
  );

  return router;
}
