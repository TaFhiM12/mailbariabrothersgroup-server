import ExcelJS from "exceljs";
import { prisma } from "../../config/database.js";

export const exportService = {
  monthlyCollectionExcel: async (month: string) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Monthly Collection");

    worksheet.columns = [
      { header: "Member Name", key: "name", width: 25 },
      { header: "Email", key: "email", width: 30 },
      { header: "Amount", key: "amount", width: 15 },
      { header: "Month", key: "month", width: 15 },
      { header: "Approved At", key: "approvedAt", width: 25 },
    ];

    const savings = await prisma.saving.findMany({
      where: {
        month,
        status: "APPROVED",
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        approvedAt: "desc",
      },
    });

    savings.forEach((saving) => {
      worksheet.addRow({
        name: saving.user.name,
        email: saving.user.email,
        amount: Number(saving.amount),
        month: saving.month,
        approvedAt: saving.approvedAt?.toISOString() ?? "",
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();

    return buffer;
  },

  expenseExcel: async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Expenses");

    worksheet.columns = [
      { header: "Title", key: "title", width: 25 },
      { header: "Amount", key: "amount", width: 15 },
      { header: "Status", key: "status", width: 15 },
      { header: "Description", key: "description", width: 35 },
      { header: "Created At", key: "createdAt", width: 25 },
    ];

    const expenses = await prisma.expense.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    expenses.forEach((expense) => {
      worksheet.addRow({
        title: expense.title,
        amount: Number(expense.amount),
        status: expense.status,
        description: expense.description ?? "",
        createdAt: expense.createdAt.toISOString(),
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();

    return buffer;
  },

  unpaidMembersExcel: async (month: string) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Unpaid Members");

    worksheet.columns = [
      { header: "Name", key: "name", width: 25 },
      { header: "Email", key: "email", width: 30 },
      { header: "Role", key: "role", width: 20 },
      { header: "Month", key: "month", width: 15 },
    ];

    const activeMembers = await prisma.user.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    const paidSavings = await prisma.saving.findMany({
      where: {
        month,
        status: "APPROVED",
      },
      select: {
        userId: true,
      },
    });

    const paidUserIds = new Set(paidSavings.map((item) => item.userId));

    const unpaidMembers = activeMembers.filter(
      (member) => !paidUserIds.has(member.id)
    );

    unpaidMembers.forEach((member) => {
      worksheet.addRow({
        name: member.name,
        email: member.email,
        role: member.role,
        month,
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();

    return buffer;
  },
};