
import { Router } from "express";

import { env } from "../config/env.js";

const router:Router = Router();

/**
 * GET /health
 * Returns the current health status of the application.
 */
router.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    status: "healthy",
    service: env.APP_NAME,
    version: env.APP_VERSION,
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

export default router;
