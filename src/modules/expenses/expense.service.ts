import { prisma } from "../../config/database.js";
import { AppError } from "../../common/errors/AppError.js";
import { Role } from "../../generated/prisma/enums.js";
import { notificationService } from "../notifications/notification.service.js";
import type {
  CreateExpenseInput,
  UpdateExpenseInput,
} from "./expense.validation.js";

const formatMoney = (amount: unknown) =>
  new Intl.NumberFormat("en-BD", {
    maximumFractionDigits: 0,
  }).format(Number(amount));

export const expenseService = {
  createExpense: async (createdBy: string, payload: CreateExpenseInput) => {
    const expense = await prisma.expense.create({
      data: {
        title: payload.title,
        amount: payload.amount,
        description: payload.description,
        imageUrl: payload.imageUrl,
        createdBy,
      },
    });

    await notificationService.createNotificationsForRoles(
      [Role.PRESIDENT, Role.ACCOUNTANT],
      {
        excludeUserIds: [createdBy],
        title: "New Expense Added",
        message: `${expense.title} expense of BDT ${formatMoney(
          expense.amount
        )} has been added to the club account.`,
      }
    );

    return expense;
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

    const cancelledExpense = await prisma.expense.update({
      where: { id },
      data: {
        status: "CANCELLED",
        cancelledBy,
        cancelledAt: new Date(),
      },
    });

    await notificationService.createNotificationsForRoles(
      [Role.PRESIDENT, Role.ACCOUNTANT],
      {
        excludeUserIds: [cancelledBy],
        title: "Expense Cancelled",
        message: `${cancelledExpense.title} expense of BDT ${formatMoney(
          cancelledExpense.amount
        )} has been cancelled.`,
      }
    );

    return cancelledExpense;
  },
};
