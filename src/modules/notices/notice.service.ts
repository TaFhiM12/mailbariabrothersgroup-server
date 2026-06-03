import { prisma } from "../../config/database.js";
import { AppError } from "../../common/errors/AppError.js";
import type {
  CreateNoticeInput,
  UpdateNoticeInput,
} from "./notice.validation.js";

export const noticeService = {
  createNotice: async (createdBy: string, payload: CreateNoticeInput) => {
    return prisma.notice.create({
      data: {
        title: payload.title,
        body: payload.body,
        createdBy,
      },
    });
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
      data: payload,
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