import { prisma } from "../../config/database.js";
import { AppError } from "../../common/errors/AppError.js";
import type {
  CreateExpenseInput,
  UpdateExpenseInput,
} from "./expense.validation.js";

export const expenseService = {
  createExpense: async (createdBy: string, payload: CreateExpenseInput) => {
    return prisma.expense.create({
      data: {
        title: payload.title,
        amount: payload.amount,
        description: payload.description,
        imageUrl: payload.imageUrl,
        createdBy,
      },
    });
  },

  getAllExpenses: async () => {
    return prisma.expense.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  getSingleExpense: async (id: string) => {
    const expense = await prisma.expense.findUnique({
      where: { id },
    });

    if (!expense) {
      throw new AppError(404, "Expense not found");
    }

    return expense;
  },

  updateExpense: async (id: string, payload: UpdateExpenseInput) => {
    const expense = await prisma.expense.findUnique({
      where: { id },
    });

    if (!expense) {
      throw new AppError(404, "Expense not found");
    }

    if (expense.status === "CANCELLED") {
      throw new AppError(409, "Cancelled expense cannot be updated");
    }

    return prisma.expense.update({
      where: { id },
      data: payload,
    });
  },

  cancelExpense: async (id: string, cancelledBy: string) => {
    const expense = await prisma.expense.findUnique({
      where: { id },
    });

    if (!expense) {
      throw new AppError(404, "Expense not found");
    }

    if (expense.status === "CANCELLED") {
      throw new AppError(409, "Expense already cancelled");
    }

    return prisma.expense.update({
      where: { id },
      data: {
        status: "CANCELLED",
        cancelledBy,
        cancelledAt: new Date(),
      },
    });
  },
};