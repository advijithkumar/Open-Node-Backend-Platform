
import pinoHttp from "pino-http";

import { logger } from "../logger/logger.js";

export const requestLogger = pinoHttp({
  logger,

  customLogLevel(_req: any, res: any, error: any) {
    if (error || res.statusCode >= 500) {
      return "error";
    }

    if (res.statusCode >= 400) {
      return "warn";
    }

    return "info";
  },

  customSuccessMessage(req : any, res: any) {
    return `${req.method} ${req.url} completed with ${res.statusCode}`;
  },

  customErrorMessage(req : any, res: any) {
    return `${req.method} ${req.url} failed with ${res.statusCode}`;
  }
});
