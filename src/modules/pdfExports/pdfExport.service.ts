import PDFDocument from "pdfkit";
import { prisma } from "../../config/database.js";

const BRAND = {
  clubName: "Mailbaria Brothers Group",
  subtitle: "Savings Management System",
  navy: "#0f172a",
  emerald: "#059669",
  emeraldSoft: "#d1fae5",
  slate: "#475569",
  border: "#cbd5e1",
  soft: "#f8fafc",
  white: "#ffffff",
};

type SummaryItem = {
  label: string;
  value: string;
};

type PdfColumn<T> = {
  header: string;
  width: number;
  align?: "left" | "right" | "center";
  value: (row: T, index: number) => string;
};

const formatCurrency = (value: number) =>
  `BDT ${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (value?: Date | null) =>
  value
    ? value.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "N/A";

const createPdfBuffer = async (
  title: string,
  subtitle: string,
  buildPdf: (doc: PDFKit.PDFDocument) => void
): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      margin: 42,
      size: "A4",
      bufferPages: true,
      info: {
        Title: title,
        Author: BRAND.clubName,
        Subject: subtitle,
      },
    });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    drawHeader(doc, title, subtitle);
    buildPdf(doc);
    drawFooters(doc);

    doc.end();
  });
};

const drawHeader = (
  doc: PDFKit.PDFDocument,
  title: string,
  subtitle: string
) => {
  const pageWidth = doc.page.width;
  const left = doc.page.margins.left;
  const top = doc.page.margins.top;
  const width = pageWidth - left - doc.page.margins.right;

  doc.rect(0, 0, pageWidth, 92).fill(BRAND.navy);

  doc
    .fillColor(BRAND.white)
    .font("Helvetica-Bold")
    .fontSize(18)
    .text(BRAND.clubName, left, top - 16, { width });

  doc
    .fillColor(BRAND.emeraldSoft)
    .font("Helvetica")
    .fontSize(9)
    .text(BRAND.subtitle, left, top + 7, { width });

  doc
    .fillColor(BRAND.white)
    .font("Helvetica-Bold")
    .fontSize(14)
    .text(title, left, top + 32, { width });

  doc
    .fillColor(BRAND.emeraldSoft)
    .font("Helvetica")
    .fontSize(9)
    .text(subtitle, left, top + 52, { width });

  doc.y = 116;
};

const drawFooters = (doc: PDFKit.PDFDocument) => {
  const pages = doc.bufferedPageRange();

  for (let index = 0; index < pages.count; index += 1) {
    doc.switchToPage(index);

    const pageNumber = index + 1;
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const left = doc.page.margins.left;
    const width = pageWidth - left - doc.page.margins.right;

    doc
      .moveTo(left, pageHeight - 42)
      .lineTo(pageWidth - doc.page.margins.right, pageHeight - 42)
      .strokeColor(BRAND.border)
      .lineWidth(0.5)
      .stroke();

    doc
      .fillColor(BRAND.slate)
      .font("Helvetica")
      .fontSize(8)
      .text(BRAND.clubName, left, pageHeight - 32, { width: width / 2 })
      .text(`Page ${pageNumber} of ${pages.count}`, left, pageHeight - 32, {
        width,
        align: "right",
      });
  }
};

const ensureSpace = (doc: PDFKit.PDFDocument, neededHeight: number) => {
  const bottom = doc.page.height - doc.page.margins.bottom - 48;

  if (doc.y + neededHeight > bottom) {
    doc.addPage();
    doc.y = doc.page.margins.top;
  }
};

const drawSectionTitle = (doc: PDFKit.PDFDocument, title: string) => {
  ensureSpace(doc, 32);
  doc
    .fillColor(BRAND.navy)
    .font("Helvetica-Bold")
    .fontSize(11)
    .text(title, doc.page.margins.left, doc.y);
  doc
    .moveTo(doc.page.margins.left, doc.y + 4)
    .lineTo(doc.page.width - doc.page.margins.right, doc.y + 4)
    .strokeColor(BRAND.emerald)
    .lineWidth(1)
    .stroke();
  doc.moveDown(0.8);
};

const drawSummary = (doc: PDFKit.PDFDocument, items: SummaryItem[]) => {
  drawSectionTitle(doc, "Executive Summary");

  const left = doc.page.margins.left;
  const gap = 10;
  const cardWidth =
    (doc.page.width - left - doc.page.margins.right - gap) / 2;
  const cardHeight = 50;

  items.forEach((item, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const x = left + col * (cardWidth + gap);
    const y = doc.y + row * (cardHeight + gap);

    ensureSpace(doc, cardHeight + gap);

    doc
      .roundedRect(x, y, cardWidth, cardHeight, 6)
      .fillAndStroke(BRAND.soft, BRAND.border);
    doc
      .fillColor(BRAND.slate)
      .font("Helvetica")
      .fontSize(8)
      .text(item.label.toUpperCase(), x + 10, y + 10, {
        width: cardWidth - 20,
      });
    doc
      .fillColor(BRAND.navy)
      .font("Helvetica-Bold")
      .fontSize(13)
      .text(item.value, x + 10, y + 26, { width: cardWidth - 20 });
  });

  doc.y += Math.ceil(items.length / 2) * (cardHeight + gap) + 8;
};

const truncate = (value: string, maxLength: number) =>
  value.length > maxLength ? `${value.slice(0, maxLength - 3)}...` : value;

const drawTable = <T>(
  doc: PDFKit.PDFDocument,
  title: string,
  columns: PdfColumn<T>[],
  rows: T[],
  emptyMessage: string
) => {
  drawSectionTitle(doc, title);

  const left = doc.page.margins.left;
  const rowHeight = 24;
  const headerHeight = 26;
  const tableWidth = columns.reduce((sum, column) => sum + column.width, 0);

  const drawHeaderRow = () => {
    ensureSpace(doc, headerHeight + rowHeight);

    let x = left;
    const y = doc.y;

    doc.rect(left, y, tableWidth, headerHeight).fill(BRAND.emerald);

    columns.forEach((column) => {
      doc
        .fillColor(BRAND.white)
        .font("Helvetica-Bold")
        .fontSize(8)
        .text(column.header, x + 5, y + 8, {
          width: column.width - 10,
          align: column.align ?? "left",
        });
      x += column.width;
    });

    doc.y += headerHeight;
  };

  drawHeaderRow();

  if (rows.length === 0) {
    doc
      .rect(left, doc.y, tableWidth, rowHeight)
      .fillAndStroke(BRAND.soft, BRAND.border);
    doc
      .fillColor(BRAND.slate)
      .font("Helvetica")
      .fontSize(9)
      .text(emptyMessage, left + 8, doc.y + 7, {
        width: tableWidth - 16,
      });
    doc.y += rowHeight + 8;
    return;
  }

  rows.forEach((row, index) => {
    if (doc.y + rowHeight > doc.page.height - doc.page.margins.bottom - 48) {
      doc.addPage();
      doc.y = doc.page.margins.top;
      drawHeaderRow();
    }

    const y = doc.y;
    let x = left;

    doc
      .rect(left, y, tableWidth, rowHeight)
      .fillAndStroke(index % 2 === 0 ? BRAND.white : BRAND.soft, BRAND.border);

    columns.forEach((column) => {
      doc
        .fillColor(BRAND.navy)
        .font("Helvetica")
        .fontSize(8)
        .text(truncate(column.value(row, index), 36), x + 5, y + 7, {
          width: column.width - 10,
          align: column.align ?? "left",
        });
      x += column.width;
    });

    doc.y += rowHeight;
  });

  doc.moveDown(0.8);
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

    return createPdfBuffer(
      "Monthly Collection Report",
      `Report Month: ${month}`,
      (doc) => {
        drawSummary(doc, [
          { label: "Report Month", value: month },
          { label: "Total Collection", value: formatCurrency(total) },
          { label: "Approved Payments", value: String(savings.length) },
          { label: "Generated At", value: formatDate(new Date()) },
        ]);

        drawTable(
          doc,
          "Approved Savings",
          [
            { header: "#", width: 28, align: "center", value: (_, i) => String(i + 1) },
            { header: "Member", width: 120, value: (row) => row.user.name },
            { header: "Email", width: 160, value: (row) => row.user.email },
            {
              header: "Amount",
              width: 88,
              align: "right",
              value: (row) => formatCurrency(Number(row.amount)),
            },
            { header: "Month", width: 58, align: "center", value: (row) => row.month },
            {
              header: "Approved",
              width: 58,
              value: (row) => formatDate(row.approvedAt),
            },
          ],
          savings,
          "No approved savings found for this month."
        );
      }
    );
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

    return createPdfBuffer("Expense Report", "All recorded expenses", (doc) => {
      drawSummary(doc, [
        { label: "Active Expense Total", value: formatCurrency(activeTotal) },
        {
          label: "Cancelled Expense Total",
          value: formatCurrency(cancelledTotal),
        },
        { label: "Total Records", value: String(expenses.length) },
        { label: "Generated At", value: formatDate(new Date()) },
      ]);

      drawTable(
        doc,
        "Expense Ledger",
        [
          { header: "#", width: 28, align: "center", value: (_, i) => String(i + 1) },
          { header: "Title", width: 130, value: (row) => row.title },
          {
            header: "Amount",
            width: 90,
            align: "right",
            value: (row) => formatCurrency(Number(row.amount)),
          },
          { header: "Status", width: 72, align: "center", value: (row) => row.status },
          {
            header: "Description",
            width: 130,
            value: (row) => row.description ?? "",
          },
          {
            header: "Created",
            width: 62,
            value: (row) => formatDate(row.createdAt),
          },
        ],
        expenses,
        "No expenses found."
      );
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
        user: {
          is: {
            isActive: true,
          },
        },
      },
      select: {
        userId: true,
      },
    });

    const paidUserIds = new Set(paidSavings.map((item) => item.userId));
    const unpaidMembers = activeMembers.filter(
      (member) => !paidUserIds.has(member.id)
    );
    const collectionRate =
      activeMembers.length > 0
        ? (paidUserIds.size / activeMembers.length) * 100
        : 0;

    return createPdfBuffer(
      "Unpaid Members Report",
      `Report Month: ${month}`,
      (doc) => {
        drawSummary(doc, [
          { label: "Report Month", value: month },
          { label: "Active Members", value: String(activeMembers.length) },
          { label: "Paid Members", value: String(paidUserIds.size) },
          { label: "Unpaid Members", value: String(unpaidMembers.length) },
          { label: "Collection Rate", value: `${collectionRate.toFixed(2)}%` },
        ]);

        drawTable(
          doc,
          "Unpaid Members",
          [
            { header: "#", width: 28, align: "center", value: (_, i) => String(i + 1) },
            { header: "Name", width: 150, value: (row) => row.name },
            { header: "Email", width: 210, value: (row) => row.email },
            { header: "Role", width: 68, align: "center", value: (row) => row.role },
            { header: "Status", width: 56, align: "center", value: () => "UNPAID" },
          ],
          unpaidMembers,
          "No unpaid members found for this month."
        );
      }
    );
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
    const currentClubBalance = totalApprovedSavings - totalActiveExpenses;

    return createPdfBuffer(
      "Club Financial Summary",
      "Current approved savings and expenses",
      (doc) => {
        drawSummary(doc, [
          {
            label: "Total Approved Savings",
            value: formatCurrency(totalApprovedSavings),
          },
          {
            label: "Total Active Expenses",
            value: formatCurrency(totalActiveExpenses),
          },
          {
            label: "Cancelled Expense Total",
            value: formatCurrency(totalCancelledExpenses),
          },
          {
            label: "Current Club Balance",
            value: formatCurrency(currentClubBalance),
          },
        ]);

        drawTable(
          doc,
          "Financial Position",
          [
            { header: "#", width: 28, align: "center", value: (_, i) => String(i + 1) },
            { header: "Metric", width: 250, value: (row) => row.metric },
            {
              header: "Amount",
              width: 180,
              align: "right",
              value: (row) => formatCurrency(row.amount),
            },
          ],
          [
            { metric: "Approved savings collected", amount: totalApprovedSavings },
            { metric: "Active expenses deducted", amount: totalActiveExpenses },
            { metric: "Cancelled expenses tracked", amount: totalCancelledExpenses },
            { metric: "Current club balance", amount: currentClubBalance },
          ],
          "No financial data found."
        );
      }
    );
  },
};
