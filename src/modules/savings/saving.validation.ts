import { z } from "zod";

export const createSavingSchema = z.object({
  body: z.object({
    amount: z.coerce.number().positive("Amount must be positive"),
    month: z.string().regex(/^\d{4}-\d{2}$/, "Month must be like 2026-06"),
    note: z.string().optional(),
  }),
});

export const updateSavingDecisionSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Saving id is required"),
  }),
  body: z.object({
    note: z.string().optional(),
  }),
});

export type CreateSavingInput = z.infer<typeof createSavingSchema>["body"];