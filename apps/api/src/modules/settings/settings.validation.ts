import { z } from "zod";

export const createSettingSchema = z.object({
  body: z.object({
    key: z.string().min(1, "Key is required"),
    value: z.string().min(1, "Value is required"),
    description: z.string().optional(),
  }),
});

export const updateSettingSchema = z.object({
  body: z.object({
    value: z.string().min(1, "Value is required"),
    description: z.string().optional(),
  }),
});
