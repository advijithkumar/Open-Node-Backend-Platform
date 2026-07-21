import { ZodError } from "zod";
import type { ErrorRequestHandler } from "express";

import { AppError } from "../errors/app-error.js";
import { logger } from "../logger/logger.js";
import { errorResponse } from "../responses/error-response.js";

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
): void => {
  // Log every error
  logger.error(err);

  // Handles known ZodError
  if (err instanceof ZodError) {
    const details = err.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));

    logger.warn(
      {
        validationErrors: details,
      },
      "Request validation failed"
    );

    errorResponse(res, {
      statusCode: 400,
      code: "VALIDATION_ERROR",
      message: "Request validation failed",
      details,
    });
    return;
  }
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
