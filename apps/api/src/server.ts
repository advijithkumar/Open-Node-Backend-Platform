import app from "./app.js";
import { bootstrap } from "./bootstrap/index.js";
import { env } from "./core/config/env.js";
import { logger } from "./core/logger/logger.js";

async function startServer(): Promise<void> {
  await bootstrap();

  const server = app.listen(env.PORT, env.HOST, () => {
    logger.info(
      {
        service: env.APP_NAME,
        version: env.APP_VERSION,
        environment: env.NODE_ENV,
        host: env.HOST,
        port: env.PORT,
      },
      `Server started successfully -- http://${env.HOST}:${env.PORT}/health`
    );
  });

  const shutdown = (signal: string): void => {
    logger.info(`Received ${signal}. Shutting down gracefully...`);

    server.close(() => {
      logger.info("HTTP server closed.");
      process.exit(0);
    });
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

startServer().catch((error) => {
  logger.fatal(error, "Failed to bootstrap ONBP.");
  process.exit(1);
});
