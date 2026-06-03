import { prisma } from "../../config/database.js";
import { AppError } from "../../common/errors/AppError.js";
import { LedgerType, SavingStatus } from "../../generated/prisma/enums.js";
import { auditLogService } from "../auditLogs/auditLog.service.js";
import type { CreateSavingInput } from "./saving.validation.js";

export const savingService = {
  createSaving: async (userId: string, payload: CreateSavingInput) => {
    const existingSaving = await prisma.saving.findFirst({
      where: {
        userId,
        month: payload.month,
      },
    });

    if (existingSaving) {
      throw new AppError(409, "Saving already submitted for this month");
    }

    const saving = await prisma.saving.create({
      data: {
        userId,
        amount: payload.amount,
        month: payload.month,
        note: payload.note,
        proofImageUrl: payload.proofImageUrl
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
    const saving = await prisma.saving.findUnique({
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

    const approvedSaving = await prisma.$transaction(async (tx) => {
      const updatedSaving = await tx.saving.update({
        where: {
          id: savingId,
        },
        data: {
          status: SavingStatus.APPROVED,
          approvedBy,
          approvedAt: new Date(),
        },
      });

      await tx.ledger.create({
        data: {
          type: LedgerType.SAVING,
          amount: saving.amount,
          description: `Monthly saving approved for ${saving.month}`,
          referenceId: saving.id,
          createdBy: approvedBy,
        },
      });

      return updatedSaving;
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
    const saving = await prisma.saving.findUnique({
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

    const rejectedSaving = await prisma.saving.update({
      where: {
        id: savingId,
      },
      data: {
        status: SavingStatus.REJECTED,
        rejectedAt: new Date(),
      },
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