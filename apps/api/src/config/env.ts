import dotenv from "dotenv";
import { z } from "zod";
import { logger } from "../logger/logger.js";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  APP_NAME: z.string().default("ONBP API"),

  APP_VERSION: z.string().default("0.1.0"),

  HOST: z.string().default("0.0.0.0"),

  PORT: z.coerce.number().int().positive().default(3000),

  LOG_LEVEL: z.enum([
    "fatal",
    "error",
    "warn",
    "info",
    "debug",
    "trace",
    "silent",
  ]).default("info"),

  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  REDIS_URL: z.string().optional().default(""),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  logger.error("❌ Invalid environment variables");
  logger.error(parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
