import type { Request, Response, NextFunction } from "express";
import { auth } from "./better-auth.js";
import { AppError } from "../errors/app-error.js";

export interface AuthenticatedRequest extends Request {
  user?: typeof auth.$Infer.Session.user;
  session?: typeof auth.$Infer.Session.session;
}

export function requireAuth() {
  return async (req: AuthenticatedRequest, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const session = await auth.api.getSession({
        headers: req.headers,
      });

      if (!session) {
        throw new AppError("Authentication required", 401, "UNAUTHORIZED");
      }

      req.user = session.user;
      req.session = session.session;
      next();
    } catch (err) {
      next(err);
    }
  };
}

export function requireRole(...allowedRoles: string[]) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError("Authentication required", 401, "UNAUTHORIZED"));
    }

    const userRole = (req.user as Record<string, unknown>).role as string || "user";
    if (!allowedRoles.includes(userRole)) {
      return next(new AppError("Insufficient permissions", 403, "FORBIDDEN"));
    }

    next();
  };
}
