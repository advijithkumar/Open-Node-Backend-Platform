import { Router, type Request, type Response } from "express";
import type { AuditService } from "./audit.service.js";
import { successResponse } from "../../core/responses/success-response.js";
import { asyncHandler } from "../../core/utils/async-handler.js";

export function createAuditRouter(auditService: AuditService): Router {
  const router = Router();

  /**
   * GET /api/v1/audit
   * Returns paginated audit logs (admin only).
   */
  router.get(
    "/",
    asyncHandler(async (req: Request, res: Response) => {
      const limit = Number(req.query.limit) || 100;
      const offset = Number(req.query.offset) || 0;
      const logs = await auditService.getAllLogs(limit, offset);
      successResponse(res, { data: logs, message: "Audit logs retrieved successfully" });
    })
  );

  /**
   * GET /api/v1/audit/user/:userId
   * Returns audit logs for a specific user.
   */
  router.get(
    "/user/:userId",
    asyncHandler(async (req: Request, res: Response) => {
      const limit = Number(req.query.limit) || 50;
      const offset = Number(req.query.offset) || 0;
      const logs = await auditService.getLogsByUser(req.params.userId as string, limit, offset);
      successResponse(res, { data: logs, message: "User audit logs retrieved successfully" });
    })
  );

  return router;
}
