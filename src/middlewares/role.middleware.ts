import type { RequestHandler } from "express";
import type { Role } from "../generated/prisma/enums.js";
import { AppError } from "../common/errors/AppError.js";

export const roleMiddleware =
  (...roles: Role[]): RequestHandler =>
  (req, _res, next) => {
    if (!req.user) {
      throw new AppError(401, "Unauthorized access");
    }

    if (!roles.includes(req.user.role)) {
      throw new AppError(403, "You are not allowed to perform this action");
    }

    next();
  };