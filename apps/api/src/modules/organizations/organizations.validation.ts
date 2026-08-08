import { z } from "zod";

export const createOrganizationsSchema = z.object({
  body: z.object({
    name: z.string().min(1),
  }),
});
