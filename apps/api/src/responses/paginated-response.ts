
import type { Response } from "express";

import type {
  PaginatedApiResponse,
  PaginationMeta
} from "./api-response.js";

/**
 * =====================================================
 * Open Node Backend Platform (ONBP)
 * Paginated Response
 * =====================================================
 *
 * Sends a standardized HTTP 200 OK response
 * with pagination metadata.
 */

export function paginatedResponse<T>(
  res: Response,
  data: T[],
  pagination: PaginationMeta,
  message = "Request completed successfully"
): Response<PaginatedApiResponse<T>> {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination,
    timestamp: new Date().toISOString()
  });
}
