import { Router, type Request, type Response } from "express";
import type { UsersModuleService } from "./users-module.service.js";
import { successResponse } from "../../core/responses/success-response.js";
import { createdResponse } from "../../core/responses/created-response.js";
import { validate } from "../../core/validation/validate.js";
import { asyncHandler } from "../../core/utils/async-handler.js";
import { createUsersModuleSchema } from "./users-module.validation.js";

export function createUsersModuleRouter(service: UsersModuleService): Router {
  const router = Router();

  router.get(
    "/",
    asyncHandler(async (_req: Request, res: Response) => {
      const items = await service.findAll();
      successResponse(res, { data: items, message: "UsersModule items retrieved successfully" });
    })
  );

  router.post(
    "/",
    validate(createUsersModuleSchema),
    asyncHandler(async (req: Request, res: Response) => {
      const item = await service.create(req.body);
      createdResponse(res, { data: item, message: "UsersModule item created successfully" });
    })
  );

  return router;
}
