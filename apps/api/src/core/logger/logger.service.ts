import { logger } from "./logger.js";
import type { ILogger } from "./logger.interface.js";

export class LoggerService implements ILogger {
  info(...args: Parameters<typeof logger.info>) {
    logger.info(...args);
  }

  warn(...args: Parameters<typeof logger.warn>) {
    logger.warn(...args);
  }

  error(...args: Parameters<typeof logger.error>) {
    logger.error(...args);
  }

  debug(...args: Parameters<typeof logger.debug>) {
    logger.debug(...args);
  }
}