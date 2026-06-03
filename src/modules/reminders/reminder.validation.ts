import { z } from "zod";

export const createMonthlyReminderSchema = z.object({
  body: z.object({
    month: z.string().regex(/^\d{4}-\d{2}$/, "Month must be like 2026-06"),
  }),
});

export type CreateMonthlyReminderInput = z.infer<
  typeof createMonthlyReminderSchema
>["body"];