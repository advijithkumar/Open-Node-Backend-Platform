import { z } from "zod";

/**
 * =====================================================
 * Open Node Backend Platform (ONBP)
 * Health Validation Schemas
 * =====================================================
 *
 * Schemas for the health endpoints.
 */

/**
 * GET /health
 *
 * No body, query parameters, or route parameters
 * are accepted.
 */
export const healthSchema = z.object({
  body: z.object({}).strict().optional(),
  query: z.object({}).strict(),
  params: z.object({}).strict()
});
