import { Router, type Request, type Response } from "express";
import type { {{pascalName}}Service } from "./{{normalizedName}}.service.js";
import { successResponse } from "../../core/responses/success-response.js";
import { createdResponse } from "../../core/responses/created-response.js";
import { validate } from "../../core/validation/validate.js";
import { asyncHandler } from "../../core/utils/async-handler.js";
import { create{{pascalName}}Schema } from "./{{normalizedName}}.validation.js";

export function create{{pascalName}}Router(service: {{pascalName}}Service): Router {
  const router = Router();

  router.get(
    "/",
    asyncHandler(async (_req: Request, res: Response) => {
      const items = await service.findAll();
      successResponse(res, { data: items, message: "{{pascalName}} items retrieved successfully" });
    })
  );

  router.post(
    "/",
    validate(create{{pascalName}}Schema),
    asyncHandler(async (req: Request, res: Response) => {
      const item = await service.create(req.body);
      createdResponse(res, { data: item, message: "{{pascalName}} item created successfully" });
    })
  );

  return router;
}
