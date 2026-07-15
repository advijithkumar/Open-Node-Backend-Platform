
import express, {type Express} from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";

import { env } from "./config/env.js";
import healthRouter from "./routes/health.route.js";
import { requestLogger } from "./middleware/request-logger.middleware.js";
import { notFoundMiddleware } from "./middleware/not-found.middleware.js";
import { errorMiddleware } from "./middleware/error.middleware.js";

const app : Express = express();

/**
 * ======================================
 * Global Middleware
 * ======================================
 */

// requestLogger use
app.use(requestLogger);

// Security Headers
app.use(helmet());

// Enable CORS
app.use(
  cors({
    origin: true,
    credentials: true
  })
);

// Compress HTTP Responses
app.use(compression());

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
 * ======================================
 * error Middleware
 * ======================================
 */

//Handle Unknown Routes
app.use(notFoundMiddleware)

//Global error Handler
app.use(errorMiddleware)



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

export default app;
