
import app from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./logger/logger.js";

const server = app.listen(env.PORT, env.HOST, () => {
  logger.info({
    service: env.APP_NAME,
    version: env.APP_VERSION,
    environment: env.NODE_ENV,
    host: env.HOST,
    port: env.PORT
  }, `Server started successfully -- http://${env.HOST}:${env.PORT}/health`);
});

/**
 * Graceful Shutdown
 */

const shutdown = (signal: string): void => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);

  server.close(() => {
    logger.info("HTTP server closed.");
    process.exit(0);
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
