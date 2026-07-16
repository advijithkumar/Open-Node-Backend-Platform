import type { Response } from "express";

/**
 * =====================================================
 * Open Node Backend Platform (ONBP)
 * No Content Response
 * =====================================================
 *
 * Sends a standardized HTTP 204 No Content response.
 *
 * Used for:
 * - DELETE operations
 * - Some PUT/PATCH operations
 * - Any successful request that intentionally
 *   returns no response body.
 */

export function noContentResponse(res: Response): Response {
  return res.status(204).send();
}
