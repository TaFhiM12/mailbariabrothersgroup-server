import { prisma } from "../../config/database.js";

export const reportService = {
  monthlyCollectionReport: async (month: string) => {
    const savings = await prisma.saving.findMany({
      where: {
        month,
        status: "APPROVED",
      },
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
        approvedAt: "desc",
      },
    });

    const totalCollected = savings.reduce(
      (sum, item) => sum + Number(item.amount),
      0
    );

    return {
      month,
      totalCollected,
      totalPayments: savings.length,
      savings,
    };
  },

  monthlyExpenseReport: async (month: string) => {
    const expenses = await prisma.expense.findMany({
      where: {
        createdAt: {
          gte: new Date(`${month}-01T00:00:00.000Z`),
          lt: new Date(
            new Date(`${month}-01T00:00:00.000Z`).getFullYear(),
            new Date(`${month}-01T00:00:00.000Z`).getMonth() + 1,
            1
          ),
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const activeExpenses = expenses.filter((item) => item.status === "ACTIVE");
    const cancelledExpenses = expenses.filter(
      (item) => item.status === "CANCELLED"
    );

    const totalActiveExpenses = activeExpenses.reduce(
      (sum, item) => sum + Number(item.amount),
      0
    );

    const totalCancelledExpenses = cancelledExpenses.reduce(
      (sum, item) => sum + Number(item.amount),
      0
    );

    return {
      month,
      totalActiveExpenses,
      totalCancelledExpenses,
      totalExpensesCount: expenses.length,
      expenses,
    };
  },

  unpaidMembersReport: async (month: string) => {
    const activeMembers = await prisma.user.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    const paidSavings = await prisma.saving.findMany({
      where: {
        month,
        status: "APPROVED",
        user: {
          is: {
            isActive: true,
          },
        },
      },
      select: {
        userId: true,
      },
    });

    const paidUserIds = new Set(paidSavings.map((item) => item.userId));

    const unpaidMembers = activeMembers.filter(
      (member) => !paidUserIds.has(member.id)
    );

    return {
      month,
      activeMembersCount: activeMembers.length,
      paidMembersCount: paidUserIds.size,
      unpaidMembersCount: unpaidMembers.length,
      collectionRate:
        activeMembers.length > 0
          ? Number(((paidUserIds.size / activeMembers.length) * 100).toFixed(2))
          : 0,
      unpaidMembers,
    };
  },

  memberSavingsReport: async (userId: string) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    const savings = await prisma.saving.findMany({
      where: { userId },
      orderBy: {
        createdAt: "desc",
      },
    });

    const approvedTotal = savings
      .filter((item) => item.status === "APPROVED")
      .reduce((sum, item) => sum + Number(item.amount), 0);

    const pendingTotal = savings
      .filter((item) => item.status === "PENDING")
      .reduce((sum, item) => sum + Number(item.amount), 0);

    const rejectedTotal = savings
      .filter((item) => item.status === "REJECTED")
      .reduce((sum, item) => sum + Number(item.amount), 0);

    return {
      user,
      summary: {
        approvedTotal,
        pendingTotal,
        rejectedTotal,
        totalRecords: savings.length,
      },
      savings,
    };
  },

  clubFinancialSummary: async () => {
    const [approvedSavings, activeExpenses, cancelledExpenses] =
      await Promise.all([
        prisma.saving.aggregate({
          where: { status: "APPROVED" },
          _sum: { amount: true },
        }),

        prisma.expense.aggregate({
          where: { status: "ACTIVE" },
          _sum: { amount: true },
        }),

        prisma.expense.aggregate({
          where: { status: "CANCELLED" },
          _sum: { amount: true },
        }),
      ]);

    const totalApprovedSavings = Number(approvedSavings._sum.amount ?? 0);
    const totalActiveExpenses = Number(activeExpenses._sum.amount ?? 0);
    const totalCancelledExpenses = Number(cancelledExpenses._sum.amount ?? 0);

    return {
      totalApprovedSavings,
      totalActiveExpenses,
      totalCancelledExpenses,
      currentClubBalance: totalApprovedSavings - totalActiveExpenses,
    };
  },
};
