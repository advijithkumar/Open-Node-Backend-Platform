import { Router, type Request, type Response } from "express";
import type { AuthModuleService } from "./auth-module.service.js";
import { successResponse } from "../../core/responses/success-response.js";
import { createdResponse } from "../../core/responses/created-response.js";
import { validate } from "../../core/validation/validate.js";
import { asyncHandler } from "../../core/utils/async-handler.js";
import { createAuthModuleSchema } from "./auth-module.validation.js";

export function createAuthModuleRouter(service: AuthModuleService): Router {
  const router = Router();

  router.get(
    "/",
    asyncHandler(async (_req: Request, res: Response) => {
      const items = await service.findAll();
      successResponse(res, { data: items, message: "AuthModule items retrieved successfully" });
    })
  );

  router.post(
    "/",
    validate(createAuthModuleSchema),
    asyncHandler(async (req: Request, res: Response) => {
      const item = await service.create(req.body);
      createdResponse(res, { data: item, message: "AuthModule item created successfully" });
    })
  );

  return router;
}
