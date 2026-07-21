import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";

import { db } from "../database/index.js";
import { authConfig } from "./auth.config.js";
import { logger } from "../logger/logger.js";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),

  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          logger.info(
            {
              authUserId: user.id,
              email: user.email,
            },
            "better auth user created",
          );
        }
      }
    }
  },

  ...authConfig,
});
