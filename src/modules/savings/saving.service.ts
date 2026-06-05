import { prisma } from "../../config/database.js";
import { AppError } from "../../common/errors/AppError.js";
import { LedgerType, SavingStatus } from "../../generated/prisma/enums.js";
import { auditLogService } from "../auditLogs/auditLog.service.js";
import type { CreateSavingInput } from "./saving.validation.js";

const assertActiveUser = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      isActive: true,
    },
  });

  if (!user || !user.isActive) {
    throw new AppError(403, "Only active users can submit savings");
  }
};

export const savingService = {
  createSaving: async (userId: string, payload: CreateSavingInput) => {
    await assertActiveUser(userId);

    const saving = await prisma.saving.create({
      data: {
        userId,
        amount: payload.amount,
        month: payload.month,
        note: payload.note,
        proofImageUrl: payload.proofImageUrl,
      },
    });

    await auditLogService.createAuditLog({
      action: "SAVING_CREATED",
      userId,
      metadata: {
        savingId: saving.id,
        amount: String(saving.amount),
        month: saving.month,
        proofImageUrl: saving.proofImageUrl,
      },
    });

    return saving;
  },

  getMySavings: async (userId: string) => {
    return prisma.saving.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  getAllSavings: async () => {
    return prisma.saving.findMany({
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
        createdAt: "desc",
      },
    });
  },

  approveSaving: async (savingId: string, approvedBy: string) => {
    const approvedSaving = await prisma.$transaction(async (tx) => {
      const saving = await tx.saving.findUnique({
        where: {
          id: savingId,
        },
      });

      if (!saving) {
        throw new AppError(404, "Saving not found");
      }

      if (saving.status === SavingStatus.APPROVED) {
        throw new AppError(409, "Saving already approved");
      }

      if (saving.status !== SavingStatus.PENDING) {
        throw new AppError(409, "Only pending savings can be approved");
      }

      const updateResult = await tx.saving.updateMany({
        where: {
          id: savingId,
          status: SavingStatus.PENDING,
        },
        data: {
          status: SavingStatus.APPROVED,
          approvedBy,
          approvedAt: new Date(),
        },
      });

      if (updateResult.count !== 1) {
        throw new AppError(409, "Saving decision was already processed");
      }

      await tx.ledger.create({
        data: {
          type: LedgerType.SAVING,
          amount: saving.amount,
          description: `Monthly saving approved for ${saving.month}`,
          referenceId: saving.id,
          createdBy: approvedBy,
        },
      });

      return tx.saving.findUniqueOrThrow({
        where: {
          id: savingId,
        },
      });
    });

    await auditLogService.createAuditLog({
      action: "SAVING_APPROVED",
      userId: approvedBy,
      metadata: {
        savingId: approvedSaving.id,
        memberId: approvedSaving.userId,
        amount: String(approvedSaving.amount),
        month: approvedSaving.month,
      },
    });

    return approvedSaving;
  },

  rejectSaving: async (savingId: string, rejectedBy?: string) => {
    const rejectedSaving = await prisma.$transaction(async (tx) => {
      const saving = await tx.saving.findUnique({
        where: {
          id: savingId,
        },
      });

      if (!saving) {
        throw new AppError(404, "Saving not found");
      }

      if (saving.status === SavingStatus.APPROVED) {
        throw new AppError(409, "Approved saving cannot be rejected");
      }

      if (saving.status !== SavingStatus.PENDING) {
        throw new AppError(409, "Only pending savings can be rejected");
      }

      const updateResult = await tx.saving.updateMany({
        where: {
          id: savingId,
          status: SavingStatus.PENDING,
        },
        data: {
          status: SavingStatus.REJECTED,
          rejectedAt: new Date(),
        },
      });

      if (updateResult.count !== 1) {
        throw new AppError(409, "Saving decision was already processed");
      }

      return tx.saving.findUniqueOrThrow({
        where: {
          id: savingId,
        },
      });
    });

    await auditLogService.createAuditLog({
      action: "SAVING_REJECTED",
      userId: rejectedBy,
      metadata: {
        savingId: rejectedSaving.id,
        memberId: rejectedSaving.userId,
        amount: String(rejectedSaving.amount),
        month: rejectedSaving.month,
      },
    });

    return rejectedSaving;
  },
};
