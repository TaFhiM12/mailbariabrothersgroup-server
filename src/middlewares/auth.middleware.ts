import type { RequestHandler } from "express";
import { prisma } from "../config/database.js";
import { AppError } from "../common/errors/AppError.js";
import { verifyToken } from "../lib/jwt.js";

export const authMiddleware: RequestHandler = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError(401, "Unauthorized access");
    }

    const token = authHeader.split(" ")[1];

    const decoded = await verifyToken(token);

    const user = await prisma.user.findUnique({
      where: {
        id: decoded.userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        imageUrl: true,
        phone: true,
        address: true,
        occupation: true,
        dateOfBirth: true,
        emergencyContactName: true,
        emergencyContactPhone: true,
        bio: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new AppError(401, "User not found");
    }

    if (!user.isActive) {
      throw new AppError(403, "User account is disabled");
    }

    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
};
