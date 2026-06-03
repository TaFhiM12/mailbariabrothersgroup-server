import PDFDocument from "pdfkit";
import { prisma } from "../../config/database.js";

const createPdfBuffer = async (
  buildPdf: (doc: PDFKit.PDFDocument) => void
): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40 });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    buildPdf(doc);

    doc.end();
  });
};

export const pdfExportService = {
  monthlyCollectionPdf: async (month: string) => {
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

    const total = savings.reduce((sum, item) => sum + Number(item.amount), 0);

    return createPdfBuffer((doc) => {
      doc.fontSize(20).text("Monthly Collection Report", { align: "center" });
      doc.moveDown();
      doc.fontSize(12).text(`Month: ${month}`);
      doc.text(`Total Collection: ${total}`);
      doc.text(`Total Payments: ${savings.length}`);
      doc.moveDown();

      savings.forEach((saving, index) => {
        doc
          .fontSize(11)
          .text(
            `${index + 1}. ${saving.user.name} | ${saving.user.email} | Amount: ${saving.amount} | Approved: ${
              saving.approvedAt?.toISOString() ?? "N/A"
            }`
          );
      });
    });
  },

  expensesPdf: async () => {
    const expenses = await prisma.expense.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    const activeTotal = expenses
      .filter((item) => item.status === "ACTIVE")
      .reduce((sum, item) => sum + Number(item.amount), 0);

    const cancelledTotal = expenses
      .filter((item) => item.status === "CANCELLED")
      .reduce((sum, item) => sum + Number(item.amount), 0);

    return createPdfBuffer((doc) => {
      doc.fontSize(20).text("Expense Report", { align: "center" });
      doc.moveDown();
      doc.fontSize(12).text(`Active Expense Total: ${activeTotal}`);
      doc.text(`Cancelled Expense Total: ${cancelledTotal}`);
      doc.text(`Total Records: ${expenses.length}`);
      doc.moveDown();

      expenses.forEach((expense, index) => {
        doc
          .fontSize(11)
          .text(
            `${index + 1}. ${expense.title} | Amount: ${expense.amount} | Status: ${expense.status} | Date: ${expense.createdAt.toISOString()}`
          );

        if (expense.description) {
          doc.text(`   Note: ${expense.description}`);
        }
      });
    });
  },

  unpaidMembersPdf: async (month: string) => {
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
      orderBy: {
        name: "asc",
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

    return createPdfBuffer((doc) => {
      doc.fontSize(20).text("Unpaid Members Report", { align: "center" });
      doc.moveDown();
      doc.fontSize(12).text(`Month: ${month}`);
      doc.text(`Active Members: ${activeMembers.length}`);
      doc.text(`Paid Members: ${paidUserIds.size}`);
      doc.text(`Unpaid Members: ${unpaidMembers.length}`);
      doc.moveDown();

      unpaidMembers.forEach((member, index) => {
        doc
          .fontSize(11)
          .text(`${index + 1}. ${member.name} | ${member.email} | ${member.role}`);
      });
    });
  },

  financialSummaryPdf: async () => {
    const [approvedSavings, activeExpenses, cancelledExpenses] =
      await Promise.all([
        prisma.saving.aggregate({
          where: { status: "APPROVED" },
          _sum: { amount: true },
        }),

        prisma.expense.aggregate({
          where: { status: "ACTIVE" },
          _sum: { amount: true },
        }),

        prisma.expense.aggregate({
          where: { status: "CANCELLED" },
          _sum: { amount: true },
        }),
      ]);

    const totalApprovedSavings = Number(approvedSavings._sum.amount ?? 0);
    const totalActiveExpenses = Number(activeExpenses._sum.amount ?? 0);
    const totalCancelledExpenses = Number(cancelledExpenses._sum.amount ?? 0);

    return createPdfBuffer((doc) => {
      doc.fontSize(20).text("Club Financial Summary", { align: "center" });
      doc.moveDown();

      doc.fontSize(12).text(`Total Approved Savings: ${totalApprovedSavings}`);
      doc.text(`Total Active Expenses: ${totalActiveExpenses}`);
      doc.text(`Total Cancelled Expenses: ${totalCancelledExpenses}`);
      doc.text(
        `Current Club Balance: ${totalApprovedSavings - totalActiveExpenses}`
      );
    });
  },
};