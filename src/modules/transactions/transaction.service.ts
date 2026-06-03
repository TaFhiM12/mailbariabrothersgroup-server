import { prisma } from "../../config/database.js";
import { AppError } from "../../common/errors/AppError.js";
import type { CreateTransactionInput } from "./transaction.validation.js";

export const transactionService = {
  createTransaction: async (payload: CreateTransactionInput) => {
    const user = await prisma.user.findUnique({
      where: {
        id: payload.userId,
      },
    });

    if (!user) {
      throw new AppError(404, "User not found");
    }

    return prisma.transaction.create({
      data: {
        userId: payload.userId,
        amount: payload.amount,
        type: payload.type,
        note: payload.note,
      },
    });
  },

  getMyTransactions: async (userId: string) => {
    return prisma.transaction.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  getAllTransactions: async () => {
    return prisma.transaction.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },
};