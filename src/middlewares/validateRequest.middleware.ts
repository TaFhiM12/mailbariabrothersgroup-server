import type { RequestHandler } from "express";
import type { ZodSchema } from "zod";

export const validateRequest =
  (schema: ZodSchema): RequestHandler =>
  async (req, _res, next) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      next();
    } catch (error) {
      next(error);
    }
  };