import type { Response } from "express";

export interface ErrorDetail {
  field?: string;
  message: string;
}

export interface ErrorResponseOptions {
  statusCode: number;
  code: string;
  message: string;
  details?: ErrorDetail[];
}

export function errorResponse(
  res: Response,
  options: ErrorResponseOptions
): Response {
  const { statusCode, code, message, details } = options;

  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      details: details ?? [],
    },
    timestamp: new Date().toISOString(),
  });
}
