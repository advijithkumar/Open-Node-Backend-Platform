import { AppError } from "./app-error.js";

/**
 * =====================================================
 * Open Node Backend Platform (ONBP)
 * Bad Request Error
 * =====================================================
 *
 * Represents an HTTP 400 Bad Request error.
 */
export class BadRequestError extends AppError {
  constructor(message = "Bad request") {
    super(message, 400, "BAD_REQUEST");
  }
}
