import { z } from "zod";

export const updateSettingSchema = z.object({
  body: z.object({
    clubName: z.string().min(2).optional(),
    monthlySavingAmount: z.coerce.number().positive().optional(),
    paymentDeadlineDay: z.coerce.number().min(1).max(28).optional(),
    reminderEnabled: z.boolean().optional(),
  }),
});

export type UpdateSettingInput = z.infer<typeof updateSettingSchema>["body"];