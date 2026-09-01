import { z } from "zod";

export const createAuthModuleSchema = z.object({
  body: z.object({
    name: z.string().min(1),
  }),
});
