import type { NextFunction, Request, Response } from "express";
import type { z, ZodError } from "zod";

/**
 * =====================================================
 * Open Node Backend Platform (ONBP)
 * Validation Middleware
 * =====================================================
 *
 * Validates incoming request data using a Zod schema.
 * Supports validation of:
 * - req.body
 * - req.query
 * - req.params
 */

export function validate(schema: z.ZodType) {
  return (
    req: Request,
    _res: Response,
    next: NextFunction
  ): void => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params
      });

      next();
    } catch (error) {
      next(error as ZodError);
    }
  };
}
