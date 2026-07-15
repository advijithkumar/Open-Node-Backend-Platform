
import { AppError } from "./app-error.js";

/**
 * =====================================================
 * Open Node Backend Platform (ONBP)
 * Forbidden Error
 * =====================================================
 *
 * Represents an HTTP 403 Forbidden error.
 */
export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, 403, "FORBIDDEN");
  }
}
