import dotenv from "dotenv";
import { z } from "zod";
import { logger } from "../logger/index.js";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  APP_NAME: z.string().default("ONBP API"),

  APP_VERSION: z.string().default("0.1.0"),

  HOST: z.string().default("0.0.0.0"),

  PORT: z.coerce.number().int().positive().default(3000),

  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),

  DATABASE_URL: z.string().default("postgres://onbp_user:password@localhost:5432/onbp"),

  REDIS_URL: z.string().optional().default(""),

  BETTER_AUTH_SECRET: z
    .string()
    .min(32, "BETTER_AUTH_SECRET must be at least 32 characters")
    .default("20ec5e10ba116563368ab18bb3190e8716d61de23bbae103efa35cb4cdf05393"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  logger.error("❌ Invalid environment variables");
  logger.error(parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
