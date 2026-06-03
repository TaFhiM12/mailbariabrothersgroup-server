import { prisma } from "../../config/database.js";
import { sendEmail } from "../../lib/email.js";
import { notificationService } from "../notifications/notification.service.js";
import type { CreateMonthlyReminderInput } from "./reminder.validation.js";

const getCurrentMonth = () => {
  const now = new Date();

  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

export const reminderService = {
  createMonthlyReminders: async (payload: CreateMonthlyReminderInput) => {
    const members = await prisma.user.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    const paidSavings = await prisma.saving.findMany({
      where: {
        month: payload.month,
        status: "APPROVED",
      },
      select: {
        userId: true,
      },
    });

    const paidUserIds = new Set(paidSavings.map((saving) => saving.userId));

    const unpaidMembers = members.filter(
      (member) => !paidUserIds.has(member.id)
    );

    const results = [];

    for (const member of unpaidMembers) {
      const existingReminder = await prisma.paymentReminder.findFirst({
        where: {
          userId: member.id,
          month: payload.month,
        },
      });

      if (existingReminder) {
        continue;
      }

      const message = `Dear ${member.name}, please pay your club savings for ${payload.month}.`;

      const reminder = await prisma.paymentReminder.create({
        data: {
          userId: member.id,
          month: payload.month,
          message,
          status: "PENDING",
        },
      });

      await notificationService.createNotification({
        userId: member.id,
        title: "Monthly Savings Payment Reminder",
        message: `You have not paid your savings for ${payload.month}. Please pay as soon as possible.`,
      });

      try {
        await sendEmail({
          to: member.email,
          subject: `Monthly Savings Payment Reminder - ${payload.month}`,
          html: `
            <h2>Monthly Savings Payment Reminder</h2>
            <p>Dear ${member.name},</p>
            <p>You have not paid your savings for <strong>${payload.month}</strong>.</p>
            <p>Please pay your savings as soon as possible.</p>
            <p>Thank you,<br/>Mailbaria Brothers Group Savings Club</p>
          `,
        });

        const updatedReminder = await prisma.paymentReminder.update({
          where: {
            id: reminder.id,
          },
          data: {
            status: "SENT",
            sentAt: new Date(),
          },
        });

        results.push(updatedReminder);
      } catch {
        const failedReminder = await prisma.paymentReminder.update({
          where: {
            id: reminder.id,
          },
          data: {
            status: "FAILED",
          },
        });

        results.push(failedReminder);
      }
    }

    return {
      month: payload.month,
      unpaidMembersCount: unpaidMembers.length,
      remindersCreated: results.length,
      reminders: results,
    };
  },

  createAutomaticMonthlyReminders: async () => {
    const month = getCurrentMonth();

    return reminderService.createMonthlyReminders({
      month,
    });
  },

  getAllReminders: async () => {
    return prisma.paymentReminder.findMany({
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

  getMyReminders: async (userId: string) => {
    return prisma.paymentReminder.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },
};