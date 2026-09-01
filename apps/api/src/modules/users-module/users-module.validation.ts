import { z } from "zod";

export const createUsersModuleSchema = z.object({
  body: z.object({
    name: z.string().min(1),
  }),
});
