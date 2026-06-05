import { prisma } from "../../config/database.js";
import { AppError } from "../../common/errors/AppError.js";
import { notificationService } from "../notifications/notification.service.js";
import { auditLogService } from "../auditLogs/auditLog.service.js";
import type {
  CreateNoticeInput,
  UpdateNoticeInput,
} from "./notice.validation.js";

export const noticeService = {
  createNotice: async (createdBy: string, payload: CreateNoticeInput) => {
    const notice = await prisma.notice.create({
      data: {
        title: payload.title,
        body: payload.body,
        imageUrl: payload.imageUrl || null,
        createdBy,
      },
    });

    await notificationService.createNotificationsForAllActiveUsers({
      excludeUserIds: [createdBy],
      title: "New Club Notice",
      message: `${notice.title}: ${notice.body.slice(0, 140)}${
        notice.body.length > 140 ? "..." : ""
      }`,
    });

    await auditLogService.createAuditLog({
      action: "NOTICE_CREATED",
      userId: createdBy,
      metadata: {
        noticeId: notice.id,
        title: notice.title,
        imageUrl: notice.imageUrl,
      },
    });

    return notice;
  },

  getAllNotices: async () => {
    return prisma.notice.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  getSingleNotice: async (id: string) => {
    const notice = await prisma.notice.findUnique({
      where: { id },
    });

    if (!notice) {
      throw new AppError(404, "Notice not found");
    }

    return notice;
  },

  updateNotice: async (id: string, payload: UpdateNoticeInput) => {
    const notice = await prisma.notice.findUnique({
      where: { id },
    });

    if (!notice) {
      throw new AppError(404, "Notice not found");
    }

    return prisma.notice.update({
      where: { id },
      data: {
        ...payload,
        imageUrl:
          payload.imageUrl === undefined ? undefined : payload.imageUrl || null,
      },
    });
  },

  deleteNotice: async (id: string) => {
    const notice = await prisma.notice.findUnique({
      where: { id },
    });

    if (!notice) {
      throw new AppError(404, "Notice not found");
    }

    await prisma.notice.delete({
      where: { id },
    });

    return null;
  },
};
