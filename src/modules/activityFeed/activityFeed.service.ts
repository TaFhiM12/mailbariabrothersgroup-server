import { prisma } from "../../config/database.js";

export const activityFeedService = {
  getRecentActivities: async () => {
    return prisma.auditLog.findMany({
      take: 50,
      orderBy: {
        createdAt: "desc",
      },
    });
  },
};