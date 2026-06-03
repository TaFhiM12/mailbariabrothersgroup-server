import { prisma } from "../../config/database.js";
import { AppError } from "../../common/errors/AppError.js";

export const notificationService = {
  createNotification: async (payload: {
    userId: string;
    title: string;
    message: string;
  }) => {
    return prisma.notification.create({
      data: payload,
    });
  },

  getMyNotifications: async (userId: string) => {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  },

  getMyUnreadCount: async (userId: string) => {
    return prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  },

  markAsRead: async (id: string, userId: string) => {
    const notification = await prisma.notification.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!notification) {
      throw new AppError(404, "Notification not found");
    }

    return prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  },

  markAllAsRead: async (userId: string) => {
    const result = await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return result;
  },
};