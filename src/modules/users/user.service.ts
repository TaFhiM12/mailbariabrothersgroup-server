import { prisma } from "../../config/database.js";
import { AppError } from "../../common/errors/AppError.js";
import type { Role } from "../../generated/prisma/enums.js";
import { auditLogService } from "../auditLogs/auditLog.service.js";
import type { UpdateMyProfileInput } from "./user.validation.js";

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
  imageUrl: true,
  phone: true,
  address: true,
  occupation: true,
  dateOfBirth: true,
  emergencyContactName: true,
  emergencyContactPhone: true,
  bio: true,
  createdAt: true,
  updatedAt: true,
};

const normalizeOptionalString = (value: string | undefined) => {
  if (value === undefined) return undefined;

  const trimmedValue = value.trim();

  return trimmedValue.length > 0 ? trimmedValue : null;
};

const normalizeRequiredString = (value: string | undefined) => {
  if (value === undefined) return undefined;

  return value.trim();
};

const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

export const userService = {
  updateMyProfile: async (id: string, payload: UpdateMyProfileInput) => {
    const updateData = {
      name: normalizeRequiredString(payload.name),
      imageUrl: normalizeOptionalString(payload.imageUrl),
      phone: normalizeOptionalString(payload.phone),
      address: normalizeOptionalString(payload.address),
      occupation: normalizeOptionalString(payload.occupation),
      dateOfBirth: normalizeOptionalString(payload.dateOfBirth),
      emergencyContactName: normalizeOptionalString(
        payload.emergencyContactName
      ),
      emergencyContactPhone: normalizeOptionalString(
        payload.emergencyContactPhone
      ),
      bio: normalizeOptionalString(payload.bio),
    };

    return prisma.user.update({
      where: { id },
      data: updateData,
      select: userSelect,
    });
  },

  getAllUsers: async () => {
    const month = getCurrentMonth();
    const [users, allSavings, currentMonthSavings] = await Promise.all([
      prisma.user.findMany({
        select: userSelect,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.saving.groupBy({
        by: ["userId", "status"],
        _sum: {
          amount: true,
        },
        _count: {
          _all: true,
        },
      }),
      prisma.saving.groupBy({
        by: ["userId"],
        where: {
          month,
          status: "APPROVED",
        },
        _sum: {
          amount: true,
        },
        _count: {
          _all: true,
        },
      }),
    ]);

    const summaryByUser = new Map<
      string,
      {
        approvedTotal: number;
        pendingTotal: number;
        rejectedTotal: number;
        approvedCount: number;
        pendingCount: number;
        rejectedCount: number;
        currentMonthApprovedTotal: number;
        currentMonthApprovedCount: number;
      }
    >();

    const ensureSummary = (userId: string) => {
      const existing = summaryByUser.get(userId);

      if (existing) return existing;

      const summary = {
        approvedTotal: 0,
        pendingTotal: 0,
        rejectedTotal: 0,
        approvedCount: 0,
        pendingCount: 0,
        rejectedCount: 0,
        currentMonthApprovedTotal: 0,
        currentMonthApprovedCount: 0,
      };

      summaryByUser.set(userId, summary);

      return summary;
    };

    allSavings.forEach((saving) => {
      const summary = ensureSummary(saving.userId);
      const amount = Number(saving._sum.amount ?? 0);
      const count = saving._count._all;

      if (saving.status === "APPROVED") {
        summary.approvedTotal = amount;
        summary.approvedCount = count;
      } else if (saving.status === "PENDING") {
        summary.pendingTotal = amount;
        summary.pendingCount = count;
      } else if (saving.status === "REJECTED") {
        summary.rejectedTotal = amount;
        summary.rejectedCount = count;
      }
    });

    currentMonthSavings.forEach((saving) => {
      const summary = ensureSummary(saving.userId);

      summary.currentMonthApprovedTotal = Number(saving._sum.amount ?? 0);
      summary.currentMonthApprovedCount = saving._count._all;
    });

    return users.map((user) => ({
      ...user,
      savingsSummary: ensureSummary(user.id),
    }));
  },

  getSingleUser: async (id: string) => {
    const user = await prisma.user.findUnique({
      where: { id },
      select: userSelect,
    });

    if (!user) {
      throw new AppError(404, "User not found");
    }

    return user;
  },

  updateUserRole: async (id: string, role: Role, updatedBy?: string) => {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new AppError(404, "User not found");
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
      select: userSelect,
    });

    await auditLogService.createAuditLog({
      action: "USER_ROLE_UPDATED",
      userId: updatedBy,
      metadata: {
        memberId: updatedUser.id,
        email: updatedUser.email,
        previousRole: user.role,
        newRole: updatedUser.role,
      },
    });

    return updatedUser;
  },

  updateUserStatus: async (
    id: string,
    isActive: boolean,
    updatedBy?: string
  ) => {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new AppError(404, "User not found");
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isActive },
      select: userSelect,
    });

    await auditLogService.createAuditLog({
      action: isActive ? "USER_ACTIVATED" : "USER_DEACTIVATED",
      userId: updatedBy,
      metadata: {
        memberId: updatedUser.id,
        email: updatedUser.email,
        previousStatus: user.isActive,
        newStatus: updatedUser.isActive,
      },
    });

    return updatedUser;
  },
};
