import { prisma } from "../../config/database.js";

const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

export const dashboardService = {
  getPresidentDashboard: async () => {
    const month = getCurrentMonth();

    const [
      totalMembers,
      activeMembers,
      inactiveMembers,
      approvedSavings,
      activeExpenses,
      cancelledExpenses,
      pendingSavings,
      rejectedSavings,
      totalNotices,
      reminders,
      failedReminders,
      paidThisMonth,
      recentSavings,
      recentExpenses,
      unreadNotifications,
    ] = await Promise.all([
      prisma.user.count({}),

      prisma.user.count({ where: { isActive: true } }),

      prisma.user.count({ where: { isActive: false } }),

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

      prisma.saving.count({ where: { status: "PENDING" } }),

      prisma.saving.count({ where: { status: "REJECTED" } }),

      prisma.notice.count(),

      prisma.paymentReminder.count(),

      prisma.paymentReminder.count({ where: { status: "FAILED" } }),

      prisma.saving.findMany({
        where: {
          month,
          status: "APPROVED",
          user: {
            is: {
              isActive: true,
            },
          },
        },
        select: { userId: true },
      }),

      prisma.saving.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      }),

      prisma.expense.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
      }),

      prisma.notification.count({
        where: { isRead: false },
      }),
    ]);

    const totalApprovedSavings = Number(approvedSavings._sum.amount ?? 0);
    const totalActiveExpenses = Number(activeExpenses._sum.amount ?? 0);
    const totalCancelledExpenses = Number(cancelledExpenses._sum.amount ?? 0);

    const paidUserIds = new Set(paidThisMonth.map((item) => item.userId));
    const unpaidMembersThisMonth = activeMembers - paidUserIds.size;

    return {
      role: "PRESIDENT",
      month,

      members: {
        totalMembers,
        activeMembers,
        inactiveMembers,
      },

      finance: {
        totalApprovedSavings,
        totalActiveExpenses,
        totalCancelledExpenses,
        currentClubBalance: totalApprovedSavings - totalActiveExpenses,
      },

      savings: {
        pendingSavings,
        rejectedSavings,
        paidMembersThisMonth: paidUserIds.size,
        unpaidMembersThisMonth,
        collectionRate:
          activeMembers > 0
            ? Number(((paidUserIds.size / activeMembers) * 100).toFixed(2))
            : 0,
      },

      reminders: {
        totalReminders: reminders,
        failedReminders,
      },

      system: {
        totalNotices,
        unreadNotifications,
      },

      recent: {
        recentSavings,
        recentExpenses,
      },
    };
  },

  getAccountantDashboard: async () => {
    const month = getCurrentMonth();

    const [
      activeMembers,
      approvedSavings,
      activeExpenses,
      pendingSavings,
      paidThisMonth,
      recentSavings,
      recentExpenses,
      unreadNotifications,
    ] = await Promise.all([
      prisma.user.count({ where: { isActive: true } }),

      prisma.saving.aggregate({
        where: { status: "APPROVED" },
        _sum: { amount: true },
      }),

      prisma.expense.aggregate({
        where: { status: "ACTIVE" },
        _sum: { amount: true },
      }),

      prisma.saving.count({ where: { status: "PENDING" } }),

      prisma.saving.findMany({
        where: {
          month,
          status: "APPROVED",
          user: {
            is: {
              isActive: true,
            },
          },
        },
        select: { userId: true },
      }),

      prisma.saving.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      }),

      prisma.expense.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
      }),

      prisma.notification.count({
        where: { isRead: false },
      }),
    ]);

    const totalApprovedSavings = Number(approvedSavings._sum.amount ?? 0);
    const totalActiveExpenses = Number(activeExpenses._sum.amount ?? 0);

    const paidUserIds = new Set(paidThisMonth.map((item) => item.userId));

    return {
      role: "ACCOUNTANT",
      month,

      finance: {
        totalApprovedSavings,
        totalActiveExpenses,
        currentClubBalance: totalApprovedSavings - totalActiveExpenses,
      },

      savings: {
        pendingSavings,
        paidMembersThisMonth: paidUserIds.size,
        unpaidMembersThisMonth: activeMembers - paidUserIds.size,
        collectionRate:
          activeMembers > 0
            ? Number(((paidUserIds.size / activeMembers) * 100).toFixed(2))
            : 0,
      },

      unreadNotifications,

      recent: {
        recentSavings,
        recentExpenses,
      },
    };
  },

  getCoordinatorDashboard: async () => {
    const month = getCurrentMonth();

    const [
      totalMembers,
      activeMembers,
      inactiveMembers,
      paidThisMonth,
      pendingReminders,
      sentReminders,
      totalNotices,
      recentNotices,
      unreadNotifications,
    ] = await Promise.all([
      prisma.user.count({}),

      prisma.user.count({ where: { isActive: true } }),

      prisma.user.count({ where: { isActive: false } }),

      prisma.saving.findMany({
        where: {
          month,
          status: "APPROVED",
          user: {
            is: {
              isActive: true,
            },
          },
        },
        select: { userId: true },
      }),

      prisma.paymentReminder.count({
        where: { status: "PENDING" },
      }),

      prisma.paymentReminder.count({
        where: { status: "SENT" },
      }),

      prisma.notice.count(),

      prisma.notice.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
      }),

      prisma.notification.count({
        where: { isRead: false },
      }),
    ]);

    const paidUserIds = new Set(paidThisMonth.map((item) => item.userId));

    return {
      role: "COORDINATOR",
      month,

      members: {
        totalMembers,
        activeMembers,
        inactiveMembers,
        paidMembersThisMonth: paidUserIds.size,
        unpaidMembersThisMonth: activeMembers - paidUserIds.size,
      },

      reminders: {
        pendingReminders,
        sentReminders,
      },

      notices: {
        totalNotices,
        recentNotices,
      },

      unreadNotifications,
    };
  },

  getMemberDashboard: async (userId: string) => {
    const month = getCurrentMonth();

    const [
      myApprovedSavings,
      myPendingSavings,
      thisMonthSaving,
      lastPayment,
      unreadNotifications,
      recentSavings,
      recentNotices,
      myReminders,
    ] = await Promise.all([
      prisma.saving.aggregate({
        where: {
          userId,
          status: "APPROVED",
        },
        _sum: { amount: true },
      }),

      prisma.saving.count({
        where: {
          userId,
          status: "PENDING",
        },
      }),

      prisma.saving.findFirst({
        where: {
          userId,
          month,
          status: "APPROVED",
        },
      }),

      prisma.saving.findFirst({
        where: {
          userId,
          status: "APPROVED",
        },
        orderBy: { approvedAt: "desc" },
      }),

      prisma.notification.count({
        where: {
          userId,
          isRead: false,
        },
      }),

      prisma.saving.findMany({
        where: { userId },
        take: 5,
        orderBy: { createdAt: "desc" },
      }),

      prisma.notice.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
      }),

      prisma.paymentReminder.findMany({
        where: { userId },
        take: 5,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const totalApprovedSavings = Number(myApprovedSavings._sum.amount ?? 0);

    return {
      role: "MEMBER",
      month,

      savings: {
        totalApprovedSavings,
        currentBalance: totalApprovedSavings,
        myPendingSavings,
        thisMonthPaymentStatus: thisMonthSaving ? "PAID" : "UNPAID",
        lastPaymentDate: lastPayment?.approvedAt ?? null,
      },

      notifications: {
        unreadNotifications,
      },

      recent: {
        recentSavings,
        recentNotices,
        myReminders,
      },
    };
  },
};
