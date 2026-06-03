import crypto from "crypto";
import bcrypt from "bcrypt";
import { Role } from "../../generated/prisma/enums.js";
import { prisma } from "../../config/database.js";
import { AppError } from "../../common/errors/AppError.js";
import { env } from "../../config/env.js";
import { createToken } from "../../lib/jwt.js";
import { sendEmail } from "../../lib/email.js";
import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
} from "./auth.validation.js";

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
        email: payload.email.toLowerCase(),
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

    const { password, passwordResetToken, passwordResetExpires, ...safeUser } =
      user;

    return {
      user: safeUser,
      token,
    };
  },

  forgotPassword: async (payload: ForgotPasswordInput) => {
    const user = await prisma.user.findUnique({
      where: {
        email: payload.email.toLowerCase(),
      },
    });

    // Do not reveal whether email exists or not
    if (!user) {
      return {
        message: "If this email exists, a reset link has been sent",
      };
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        passwordResetToken: hashedToken,
        passwordResetExpires: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    const clientUrl = process.env.CLIENT_URL || "";
    const resetUrl = `${clientUrl}/reset-password?token=${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: "Reset your password",
      html: `
        <h2>Password Reset Request</h2>
        <p>Hello ${user.name},</p>
        <p>Click the link below to reset your password:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>This link will expire in 15 minutes.</p>
        <p>If you did not request this, you can safely ignore this email.</p>
      `,
    });

    return {
      message: "If this email exists, a reset link has been sent",
    };
  },

  resetPassword: async (payload: ResetPasswordInput) => {
    const hashedToken = crypto
      .createHash("sha256")
      .update(payload.token)
      .digest("hex");

    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new AppError(400, "Invalid or expired reset token");
    }

    const hashedPassword = await bcrypt.hash(
      payload.password,
      env.BCRYPT_SALT_ROUNDS
    );

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    return {
      message: "Password reset successfully",
    };
  },
};