import { prisma } from "../../config/database.js";
import { AppError } from "../../common/errors/AppError.js";
import type { Role } from "../../generated/prisma/enums.js";

type NotificationPayload = {
  title: string;
  message: string;
};

type AudienceOptions = NotificationPayload & {
  excludeUserIds?: string[];
};

const uniqueIds = (ids: string[]) => Array.from(new Set(ids));

const createManyForUserIds = async (
  userIds: string[],
  payload: NotificationPayload
) => {
  const recipients = uniqueIds(userIds).filter(Boolean);

  if (recipients.length === 0) {
    return { count: 0 };
  }

  return prisma.notification.createMany({
    data: recipients.map((userId) => ({
      userId,
      title: payload.title,
      message: payload.message,
    })),
  });
};

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

  createNotificationsForUsers: async (
    userIds: string[],
    payload: NotificationPayload
  ) => {
    return createManyForUserIds(userIds, payload);
  },

  createNotificationsForRoles: async (
    roles: Role[],
    { excludeUserIds = [], ...payload }: AudienceOptions
  ) => {
    const excluded = new Set(excludeUserIds);
    const users = await prisma.user.findMany({
      where: {
        role: {
          in: roles,
        },
        isActive: true,
        id: {
          notIn: Array.from(excluded),
        },
      },
      select: {
        id: true,
      },
    });

    return createManyForUserIds(
      users.map((user) => user.id),
      payload
    );
  },

  createNotificationsForAllActiveUsers: async ({
    excludeUserIds = [],
    ...payload
  }: AudienceOptions) => {
    const users = await prisma.user.findMany({
      where: {
        isActive: true,
        id: {
          notIn: excludeUserIds,
        },
      },
      select: {
        id: true,
      },
    });

    return createManyForUserIds(
      users.map((user) => user.id),
      payload
    );
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
