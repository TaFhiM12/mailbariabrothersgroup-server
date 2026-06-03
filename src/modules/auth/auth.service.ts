import bcrypt from "bcrypt";
import { Role } from "../../generated/prisma/enums.js";
import { prisma } from "../../config/database.js";
import { AppError } from "../../common/errors/AppError.js";
import { env } from "../../config/env.js";
import { createToken } from "../../lib/jwt.js";
import type { LoginInput, RegisterInput } from "./auth.validation.js";

const sanitizeUser = (user: {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}) => user;

export const authService = {
  register: async (payload: RegisterInput) => {
    const existingUser = await prisma.user.findUnique({
      where: {
        email: payload.email,
      },
    });

    if (existingUser) {
      throw new AppError(409, "User already exists with this email");
    }

    const hashedPassword = await bcrypt.hash(
      payload.password,
      env.BCRYPT_SALT_ROUNDS
    );

    const user = await prisma.user.create({
      data: {
        name: payload.name,
        email: payload.email.toLowerCase(),
        password: hashedPassword,
        role: Role.MEMBER,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const token = await createToken({
      userId: user.id,
      role: user.role,
    });

    return {
      user: sanitizeUser(user),
      token,
    };
  },

  login: async (payload: LoginInput) => {
    const user = await prisma.user.findUnique({
      where: {
        email: payload.email.toLowerCase(),
      },
    });

    if (!user) {
      throw new AppError(401, "Invalid email or password");
    }

    if (!user.isActive) {
      throw new AppError(403, "Your account is disabled");
    }

    const isPasswordMatched = await bcrypt.compare(
      payload.password,
      user.password
    );

    if (!isPasswordMatched) {
      throw new AppError(401, "Invalid email or password");
    }

    const token = await createToken({
      userId: user.id,
      role: user.role,
    });

    const { password, ...safeUser } = user;

    return {
      user: safeUser,
      token,
    };
  },
};