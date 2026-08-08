import { Router, type Request, type Response } from "express";
import type { SettingsService } from "./settings.service.js";
import { successResponse } from "../../core/responses/success-response.js";
import { createdResponse } from "../../core/responses/created-response.js";
import { noContentResponse } from "../../core/responses/no-content-response.js";
import { validate } from "../../core/validation/validate.js";
import { asyncHandler } from "../../core/utils/async-handler.js";
import { createSettingSchema, updateSettingSchema } from "./settings.validation.js";
import { requireAuth, requireRole } from "../../core/auth/auth.middleware.js";

export function createSettingsRouter(service: SettingsService): Router {
  const router = Router();

  router.get(
    "/",
    requireAuth(),
    asyncHandler(async (req: Request, res: Response) => {
      const limit = req.query.limit ? Number(req.query.limit) : 50;
      const offset = req.query.offset ? Number(req.query.offset) : 0;
      const items = await service.findAll(limit, offset);
      successResponse(res, { data: items, message: "Settings items retrieved successfully" });
    })
  );

  router.get(
    "/:key",
    requireAuth(),
    asyncHandler(async (req: Request, res: Response) => {
      const rawKey = req.params.key;
      const key = Array.isArray(rawKey) ? rawKey[0] : rawKey;
      const item = await service.findByKey(key);
      if (!item) {
        res.status(404).json({ error: `Setting not found for key: ${key}` });
        return;
      }
      successResponse(res, { data: item, message: "Setting retrieved successfully" });
    })
  );

  router.post(
    "/",
    requireAuth(),
    requireRole("admin"),
    validate(createSettingSchema),
    asyncHandler(async (req: Request, res: Response) => {
      const item = await service.create(req.body);
      createdResponse(res, { data: item, message: "Setting created successfully" });
    })
  );

  router.put(
    "/:key",
    requireAuth(),
    requireRole("admin"),
    validate(updateSettingSchema),
    asyncHandler(async (req: Request, res: Response) => {
      const rawKey = req.params.key;
      const key = Array.isArray(rawKey) ? rawKey[0] : rawKey;
      const item = await service.update(key, req.body);
      successResponse(res, { data: item, message: "Setting updated successfully" });
    })
  );

  router.delete(
    "/:key",
    requireAuth(),
    requireRole("admin"),
    asyncHandler(async (req: Request, res: Response) => {
      const rawKey = req.params.key;
      const key = Array.isArray(rawKey) ? rawKey[0] : rawKey;
      await service.delete(key);
      noContentResponse(res);
    })
  );

  return router;
}
export default createSettingsRouter;
