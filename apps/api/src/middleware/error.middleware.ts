
import type { ErrorRequestHandler } from "express";

import { AppError } from "../errors/app-error.js";
import { logger } from "../logger/logger.js";

/**
 * =====================================================
 * Open Node Backend Platform (ONBP)
 * Global Error Middleware
 * =====================================================
 *
 * Handles all application errors and returns
 * a standardized JSON response.
 */

export const errorMiddleware: ErrorRequestHandler = (
  err,
  _req,
  res,
  _next
) => {
  // Log every error
  logger.error(err);

  // Handle known application errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message
      },
      timestamp: new Date().toISOString()
    });

    return;
  }

  // Handle unexpected errors
  res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message:
        process.env.NODE_ENV === "production"
          ? "Internal server error"
          : err instanceof Error
            ? err.message
            : "Unknown error"
    },
    timestamp: new Date().toISOString()
  });
};
