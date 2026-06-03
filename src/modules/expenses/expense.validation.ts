import { z } from "zod";

export const createExpenseSchema = z.object({
  body: z.object({
    title: z.string().min(2, "Title is required"),
    amount: z.coerce.number().positive("Amount must be positive"),
    description: z.string().optional(),
    imageUrl: z.url("Invalid image URL").optional(),
  }),
});

export const updateExpenseSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Expense id is required"),
  }),
  body: z.object({
    title: z.string().min(2).optional(),
    amount: z.coerce.number().positive().optional(),
    description: z.string().optional(),
    imageUrl: z.url("Invalid image URL").optional(),
  }),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>["body"];
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>["body"];