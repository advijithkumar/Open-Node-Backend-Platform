import { env } from "../config/env.js";

export const authConfig = {
  appName: env.APP_NAME,

  baseURL: `http://${env.HOST}:${env.PORT}`,

  secret: env.BETTER_AUTH_SECRET,

  trustedOrigins: [
    `http://${env.HOST}:${env.PORT}`,
  ],

  emailAndPassword: {
    enabled: true,
  },
};
