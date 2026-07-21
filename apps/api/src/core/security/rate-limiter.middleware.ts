import type { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/app-error.js";

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

export function createRateLimiter(options: { max: number; windowMs: number }) {
  const hits = new Map<string, RateLimitRecord>();

  return (req: Request, _res: Response, next: NextFunction): void => {
    const key = req.ip || "unknown";
    const now = Date.now();
    const record = hits.get(key);

    if (!record || now > record.resetTime) {
      hits.set(key, { count: 1, resetTime: now + options.windowMs });
      return next();
    }

    if (record.count >= options.max) {
      return next(new AppError("Too many requests, please try again later.", 429, "RATE_LIMIT_EXCEEDED"));
    }

    record.count++;
    next();
  };
}
