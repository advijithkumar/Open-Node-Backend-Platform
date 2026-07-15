import { AppError } from "./app-error.js";

/**
 * =====================================================
 * Open Node Backend Platform (ONBP)
 * Not Found Error
 * =====================================================
 *
 * Represents an HTTP 404 Not Found error.
 */
export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404, "NOT_FOUND");
  }
}
