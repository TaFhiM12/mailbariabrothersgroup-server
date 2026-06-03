import { z } from "zod";

export const monthQuerySchema = z.object({
  query: z.object({
    month: z.string().regex(/^\d{4}-\d{2}$/, "Month must be like 2026-06"),
  }),
});

export const memberReportSchema = z.object({
  params: z.object({
    userId: z.string().min(1, "User id is required"),
  }),
});