import { Router, type Request, type Response } from "express";
import type { OrganizationsService } from "./organizations.service.js";
import { successResponse } from "../../core/responses/success-response.js";
import { createdResponse } from "../../core/responses/created-response.js";
import { validate } from "../../core/validation/validate.js";
import { asyncHandler } from "../../core/utils/async-handler.js";
import { createOrganizationsSchema } from "./organizations.validation.js";

export function createOrganizationsRouter(service: OrganizationsService): Router {
  const router = Router();

  router.get(
    "/",
    asyncHandler(async (_req: Request, res: Response) => {
      const items = await service.findAll();
      successResponse(res, { data: items, message: "Organizations items retrieved successfully" });
    })
  );

  router.post(
    "/",
    validate(createOrganizationsSchema),
    asyncHandler(async (req: Request, res: Response) => {
      const item = await service.create(req.body);
      createdResponse(res, { data: item, message: "Organizations item created successfully" });
    })
  );

  return router;
}
