
import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import swaggerUi from "swagger-ui-express";

import { env } from "./core/config/env.js";
import healthRouter from "./routes/health.route.js";
import { requestLogger } from "./core/middleware/request-logger.middleware.js";
import { notFoundMiddleware } from "./core/middleware/not-found.middleware.js";
import { errorMiddleware } from "./core/middleware/error.middleware.js";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./core/auth/better-auth.js";
import { swaggerSpec } from "./core/docs/swagger.js";

const app: Express = express();

/**
 * ======================================
 * Global Middleware
 * ======================================
 */

// requestLogger use
app.use(requestLogger);

// Security Headers — relax CSP for Swagger UI assets
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  })
);

// Enable CORS
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// Compress HTTP Responses
app.use(compression());

// better auth
app.all("/api/auth/*splat", toNodeHandler(auth));

// Parse JSON Requests
app.use(express.json());

// Parse URL Encoded Requests
app.use(express.urlencoded({ extended: true }));

/**
 * ======================================
 * API Routes
 * ======================================
 */

app.use("/health", healthRouter);

/**
 * Swagger / OpenAPI Documentation
 * Available at: /api/docs
 */
app.use(
  "/api/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: "ONBP API Docs",
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
    },
  })
);

// Serve raw OpenAPI JSON spec
app.get("/api/docs.json", (_req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

/**
 * ======================================
 * error Middleware
 * ======================================
 */



/**
 * ======================================
 * Root Endpoint
 * ======================================
 */

app.get("/", (_req, res) => {
  res.json({
    message: `Welcome to ${env.APP_NAME}`,
    version: env.APP_VERSION,
    environment: env.NODE_ENV
  });
});


//Handle Unknown Routes
app.use(notFoundMiddleware)

//Global error Handler
app.use(errorMiddleware)



export default app;
