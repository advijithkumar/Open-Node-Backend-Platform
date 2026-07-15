
import dotenv from "dotenv";

dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",

  APP_NAME: process.env.APP_NAME ?? "ONBP API",

  APP_VERSION: process.env.APP_VERSION ?? "0.1.0",

  HOST: process.env.HOST ?? "0.0.0.0",

  PORT: Number(process.env.PORT ?? 3000),

  LOG_LEVEL: process.env.LOG_LEVEL ?? "info",

  DATABASE_URL: process.env.DATABASE_URL ?? "",

  REDIS_URL: process.env.REDIS_URL ?? ""
};
