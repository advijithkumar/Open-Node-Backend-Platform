
import type { Response } from "express";

import type { ApiResponse } from "./api-response.js";

/**
 * =====================================================
 * Open Node Backend Platform (ONBP)
 * Success Response
 * =====================================================
 *
 * Sends a standardized HTTP 200 OK response.
 */

export function successResponse<T>(
  res: Response,
  data: T,
  message = "Request completed successfully"
): Response<ApiResponse<T>> {
  return res.status(200).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
}
