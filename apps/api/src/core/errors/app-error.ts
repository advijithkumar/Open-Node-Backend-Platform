
/**
 * =====================================================
 * Open Node Backend Platform (ONBP)
 * Base Application Error
 * =====================================================
 *
 * All custom application errors should extend this class.
 */

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number,
    code: string,
    isOperational = true
  ) {
    super(message);

    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;

    // Preserve proper stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}
