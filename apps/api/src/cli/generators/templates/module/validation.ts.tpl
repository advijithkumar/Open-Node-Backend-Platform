import { z } from "zod";

export const create{{pascalName}}Schema = z.object({
  body: z.object({
    name: z.string().min(1),
  }),
});
