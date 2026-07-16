import type { Response } from "express";

import type { ApiResponse } from "./api-response.js";

/**
 * =====================================================
 * Open Node Backend Platform (ONBP)
 * Created Response
 * =====================================================
 *
 * Sends a standardized HTTP 201 Created response.
 */

export function createdResponse<T>(
  res: Response,
  data: T,
  message = "Resource created successfully"
): Response<ApiResponse<T>> {
  return res.status(201).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
}
