import { prisma } from "../../config/database.js";
import type { Prisma } from "../../generated/prisma/client.js";

type CreateAuditLogPayload = {
  action: string;
  userId?: string;
  metadata?: Prisma.InputJsonValue;
};

export const auditLogService = {
  createAuditLog: async (payload: CreateAuditLogPayload) => {
    try {
      return await prisma.auditLog.create({
        data: {
          action: payload.action,
          userId: payload.userId ?? null,
          metadata: payload.metadata ?? {},
        },
      });
    } catch (error) {
      console.error("Failed to create audit log:", error);
      return null;
    }
  },

  getAllAuditLogs: async () => {
    return prisma.auditLog.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  getAuditLogsByUser: async (userId: string) => {
    return prisma.auditLog.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  getAuditLogsByAction: async (action: string) => {
    return prisma.auditLog.findMany({
      where: {
        action,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },
};