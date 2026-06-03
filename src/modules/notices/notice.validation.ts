import { z } from "zod";

export const createNoticeSchema = z.object({
  body: z.object({
    title: z.string().min(2, "Title is required"),
    body: z.string().min(5, "Body is required"),
  }),
});

export const updateNoticeSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Notice id is required"),
  }),
  body: z.object({
    title: z.string().min(2).optional(),
    body: z.string().min(5).optional(),
  }),
});

export type CreateNoticeInput = z.infer<typeof createNoticeSchema>["body"];
export type UpdateNoticeInput = z.infer<typeof updateNoticeSchema>["body"];