import { AppError } from "./app-error.js";

/**
 * =====================================================
 * Open Node Backend Platform (ONBP)
 * Unauthorized Error
 * =====================================================
 *
 * Represents an HTTP 401 Unauthorized error.
 */
export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401, "UNAUTHORIZED");
  }
}
