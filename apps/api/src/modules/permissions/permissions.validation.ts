import { z } from "zod";

export const createPermissionSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    slug: z.string().min(1, "Slug is required"),
    resource: z.string().min(1, "Resource is required"),
    action: z.string().min(1, "Action is required"),
    description: z.string().optional(),
    isSystem: z.boolean().optional(),
  }),
});

export const updatePermissionSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    slug: z.string().optional(),
    description: z.string().optional(),
  }),
});
export default {};
