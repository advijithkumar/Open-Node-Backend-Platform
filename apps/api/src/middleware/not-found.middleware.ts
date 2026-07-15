import type { NextFunction, Request, Response } from "express";

import { NotFoundError } from "../errors/not-found.error.js";

/**
 * =====================================================
 * Open Node Backend Platform (ONBP)
 * Not Found Middleware
 * =====================================================
 *
 * Handles all unmatched routes by forwarding
 * a NotFoundError to the global error handler.
 */
export function notFoundMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  next(
    new NotFoundError(
      `Route '${req.method} ${req.originalUrl}' was not found`
    )
  );
}
