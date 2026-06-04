import { z } from "zod";
import { Role } from "../../generated/prisma/enums.js";

export const updateUserRoleSchema = z.object({
  params: z.object({
    id: z.string().min(1, "User id is required"),
  }),
  body: z.object({
    role: z.enum(Role),
  }),
});

export const updateUserStatusSchema = z.object({
  params: z.object({
    id: z.string().min(1, "User id is required"),
  }),
  body: z.object({
    isActive: z.boolean(),
  }),
});

export const updateMyProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters").optional(),
    imageUrl: z.url("Invalid image URL").optional().or(z.literal("")),
    phone: z.string().max(30).optional().or(z.literal("")),
    address: z.string().max(300).optional().or(z.literal("")),
    occupation: z.string().max(120).optional().or(z.literal("")),
    dateOfBirth: z.string().max(20).optional().or(z.literal("")),
    emergencyContactName: z.string().max(120).optional().or(z.literal("")),
    emergencyContactPhone: z.string().max(30).optional().or(z.literal("")),
    bio: z.string().max(500).optional().or(z.literal("")),
  }),
});

export type UpdateMyProfileInput = z.infer<
  typeof updateMyProfileSchema
>["body"];
