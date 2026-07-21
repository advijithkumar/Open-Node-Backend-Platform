import { Router, type Request, type Response } from "express";
import { z } from "zod";
import type { SettingService } from "./settings.service.js";
import { successResponse } from "../../core/responses/success-response.js";
import { noContentResponse } from "../../core/responses/no-content-response.js";
import { validate } from "../../core/validation/validate.js";
import { asyncHandler } from "../../core/utils/async-handler.js";

const upsertSettingSchema = z.object({
  body: z.object({
    key: z.string().min(1).max(200),
    value: z.unknown(),
    description: z.string().optional(),
    group: z.string().optional(),
  }),
});

export function createSettingsRouter(settingService: SettingService): Router {
  const router = Router();

  router.get(
    "/",
    asyncHandler(async (req: Request, res: Response) => {
      const group = req.query.group as string | undefined;
      const settings = await settingService.getAll(group);
      successResponse(res, { data: settings, message: "Settings retrieved successfully" });
    })
  );

  router.get(
    "/:key",
    asyncHandler(async (req: Request, res: Response) => {
      const setting = await settingService.get(req.params.key as string);
      successResponse(res, { data: setting });
    })
  );

  router.put(
    "/",
    validate(upsertSettingSchema),
    asyncHandler(async (req: Request, res: Response) => {
      const { key, value, description, group } = req.body as {
        key: string;
        value: unknown;
        description?: string;
        group?: string;
      };
      const setting = await settingService.set(key, value, description, group);
      successResponse(res, { data: setting, message: "Setting saved successfully" });
    })
  );

  router.delete(
    "/:key",
    asyncHandler(async (req: Request, res: Response) => {
      await settingService.delete(req.params.key as string);
      noContentResponse(res);
    })
  );

  return router;
}
