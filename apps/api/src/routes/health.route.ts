
import { Router } from "express";

import { env } from "../core/config/env.js";
import { successResponse } from "../core/responses/success-response.js";
import { validate } from "../core/validation/validate.js";
import { healthSchema } from "../core/validation/schemas/health.schema.js";

const router:Router = Router();

/**
 * GET /health
 * Returns the current health status of the application.
 */
router.get("/", validate(healthSchema), (_req, res) => {
  return successResponse(res, {
      success: true,
      status: "healthy",
      service: env.APP_NAME,
      version: env.APP_VERSION,
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
  })
});


export default router;
