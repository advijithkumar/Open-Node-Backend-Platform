import { z } from "zod";

export const createRoleSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    slug: z.string().min(1, "Slug is required"),
    description: z.string().optional(),
    isSystem: z.boolean().optional(),
  }),
});

export const updateRoleSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    slug: z.string().optional(),
    description: z.string().optional(),
  }),
});

export const assignPermissionSchema = z.object({
  body: z.object({
    permissionId: z.string().uuid("Invalid Permission ID format"),
  }),
});

export const replacePermissionsSchema = z.object({
  body: z.object({
    permissionIds: z.array(z.string().uuid("Invalid Permission ID format")),
  }),
});
