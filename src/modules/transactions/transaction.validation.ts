import { z } from "zod";
import { TransactionType } from "../../generated/prisma/enums.js";

export const createTransactionSchema = z.object({
  body: z.object({
    userId: z.string().min(1, "User id is required"),
    amount: z.coerce.number().positive("Amount must be positive"),
    type: z.enum(TransactionType),
    note: z.string().optional(),
  }),
});

export type CreateTransactionInput = z.infer<
  typeof createTransactionSchema
>["body"];