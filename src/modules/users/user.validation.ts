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