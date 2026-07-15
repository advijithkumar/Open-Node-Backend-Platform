
import type {
  NextFunction,
  Request,
  RequestHandler,
  Response
} from "express";

/**
 * =====================================================
 * Open Node Backend Platform (ONBP)
 * Async Handler
 * =====================================================
 *
 * Wraps asynchronous route handlers and automatically
 * forwards errors to Express error-handling middleware.
 */

type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

export const asyncHandler = (
  handler: AsyncHandler
): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
};
