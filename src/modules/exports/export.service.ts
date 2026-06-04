import ExcelJS from "exceljs";
import { prisma } from "../../config/database.js";

const BRAND = {
  clubName: "Mailbaria Brothers Group",
  subtitle: "Savings Management System",
  navy: "0F172A",
  emerald: "059669",
  emeraldLight: "D1FAE5",
  slate: "475569",
  border: "CBD5E1",
  soft: "F8FAFC",
  white: "FFFFFF",
};

const currencyFormat = '"BDT" #,##0.00';
const dateFormat = "yyyy-mm-dd hh:mm";

type SummaryItem = {
  label: string;
  value: string | number | Date;
  format?: string;
};

type ReportColumn = {
  header: string;
  key: string;
  width: number;
  style?: Partial<ExcelJS.Style>;
};

const createWorkbook = (reportTitle: string) => {
  const workbook = new ExcelJS.Workbook();

  workbook.creator = BRAND.clubName;
  workbook.company = BRAND.clubName;
  workbook.subject = reportTitle;
  workbook.title = reportTitle;
  workbook.created = new Date();
  workbook.modified = new Date();

  return workbook;
};

const addReportHeader = (
  worksheet: ExcelJS.Worksheet,
  title: string,
  subtitle: string,
  columnCount: number
) => {
  worksheet.mergeCells(1, 1, 1, columnCount);
  worksheet.mergeCells(2, 1, 2, columnCount);

  const titleCell = worksheet.getCell(1, 1);
  titleCell.value = BRAND.clubName;
  titleCell.font = {
    bold: true,
    size: 18,
    color: { argb: BRAND.white },
  };
  titleCell.alignment = { vertical: "middle", horizontal: "left" };
  titleCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: BRAND.navy },
  };

  const subtitleCell = worksheet.getCell(2, 1);
  subtitleCell.value = `${title} | ${subtitle}`;
  subtitleCell.font = {
    bold: true,
    size: 11,
    color: { argb: BRAND.emeraldLight },
  };
  subtitleCell.alignment = { vertical: "middle", horizontal: "left" };
  subtitleCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: BRAND.navy },
  };

  worksheet.getRow(1).height = 26;
  worksheet.getRow(2).height = 22;
};

const addSummary = (
  worksheet: ExcelJS.Worksheet,
  items: SummaryItem[],
  startRow: number
) => {
  items.forEach((item, index) => {
    const row = worksheet.getRow(startRow + index);
    const labelCell = row.getCell(1);
    const valueCell = row.getCell(2);

    labelCell.value = item.label;
    labelCell.font = { bold: true, color: { argb: BRAND.slate } };
    labelCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: BRAND.soft },
    };

    valueCell.value = item.value;
    valueCell.font = { bold: true, color: { argb: BRAND.navy } };

    if (item.format) {
      valueCell.numFmt = item.format;
    }

    [labelCell, valueCell].forEach((cell) => {
      cell.border = {
        top: { style: "thin", color: { argb: BRAND.border } },
        bottom: { style: "thin", color: { argb: BRAND.border } },
        left: { style: "thin", color: { argb: BRAND.border } },
        right: { style: "thin", color: { argb: BRAND.border } },
      };
      cell.alignment = { vertical: "middle" };
    });

    row.height = 22;
  });
};

const addReportTable = (
  worksheet: ExcelJS.Worksheet,
  tableName: string,
  columns: ReportColumn[],
  rows: Record<string, string | number | Date | null>[],
  startRow: number
) => {
  worksheet.columns = columns.map((column) => ({
    key: column.key,
    width: column.width,
    style: column.style,
  }));

  const tableRows =
    rows.length > 0
      ? rows.map((row) =>
          columns.map((column) => row[column.key] ?? "")
        )
      : [columns.map((_, index) => (index === 0 ? "No records found" : ""))];

  worksheet.addTable({
    name: tableName,
    ref: `A${startRow}`,
    headerRow: true,
    totalsRow: false,
    style: {
      theme: "TableStyleMedium4",
      showRowStripes: true,
    },
    columns: columns.map((column) => ({
      name: column.header,
      filterButton: true,
    })),
    rows: tableRows,
  });

  const headerRow = worksheet.getRow(startRow);
  headerRow.height = 24;
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: BRAND.white } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: BRAND.emerald },
    };
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });

  const lastRow = startRow + tableRows.length;

  for (let rowNumber = startRow + 1; rowNumber <= lastRow; rowNumber += 1) {
    const row = worksheet.getRow(rowNumber);
    row.height = 22;

    row.eachCell((cell, colNumber) => {
      cell.border = {
        top: { style: "thin", color: { argb: BRAND.border } },
        bottom: { style: "thin", color: { argb: BRAND.border } },
        left: { style: "thin", color: { argb: BRAND.border } },
        right: { style: "thin", color: { argb: BRAND.border } },
      };
      cell.alignment = {
        vertical: "middle",
        horizontal: colNumber === 1 ? "center" : "left",
        wrapText: true,
      };
    });
  }

  worksheet.views = [
    {
      state: "frozen",
      ySplit: startRow,
      activeCell: `A${startRow + 1}`,
    },
  ];
};

const finishWorksheet = (worksheet: ExcelJS.Worksheet) => {
  worksheet.properties.defaultRowHeight = 20;
  worksheet.pageSetup = {
    orientation: "landscape",
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    paperSize: 9,
    margins: {
      left: 0.35,
      right: 0.35,
      top: 0.5,
      bottom: 0.5,
      header: 0.2,
      footer: 0.2,
    },
  };
  worksheet.headerFooter.oddFooter =
    `&L${BRAND.clubName}&CGenerated ${new Date().toLocaleDateString()}&RPage &P of &N`;
};

export const exportService = {
  monthlyCollectionExcel: async (month: string) => {
    const workbook = createWorkbook("Monthly Collection Report");
    const worksheet = workbook.addWorksheet("Collection");

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
    const columns: ReportColumn[] = [
      { header: "#", key: "serial", width: 8 },
      { header: "Member Name", key: "name", width: 26 },
      { header: "Email", key: "email", width: 34 },
      {
        header: "Amount",
        key: "amount",
        width: 16,
        style: { numFmt: currencyFormat },
      },
      { header: "Month", key: "month", width: 14 },
      {
        header: "Approved At",
        key: "approvedAt",
        width: 22,
        style: { numFmt: dateFormat },
      },
    ];

    addReportHeader(worksheet, "Monthly Collection Report", month, columns.length);
    addSummary(
      worksheet,
      [
        { label: "Report Month", value: month },
        { label: "Total Collection", value: total, format: currencyFormat },
        { label: "Approved Payments", value: savings.length },
        { label: "Generated At", value: new Date(), format: dateFormat },
      ],
      4
    );
    addReportTable(
      worksheet,
      "MonthlyCollection",
      columns,
      savings.map((saving, index) => ({
        serial: index + 1,
        name: saving.user.name,
        email: saving.user.email,
        amount: Number(saving.amount),
        month: saving.month,
        approvedAt: saving.approvedAt,
      })),
      10
    );
    finishWorksheet(worksheet);

    return workbook.xlsx.writeBuffer();
  },

  expenseExcel: async () => {
    const workbook = createWorkbook("Expense Report");
    const worksheet = workbook.addWorksheet("Expenses");

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

    const columns: ReportColumn[] = [
      { header: "#", key: "serial", width: 8 },
      { header: "Title", key: "title", width: 28 },
      {
        header: "Amount",
        key: "amount",
        width: 16,
        style: { numFmt: currencyFormat },
      },
      { header: "Status", key: "status", width: 15 },
      { header: "Description", key: "description", width: 42 },
      {
        header: "Created At",
        key: "createdAt",
        width: 22,
        style: { numFmt: dateFormat },
      },
    ];

    addReportHeader(worksheet, "Expense Report", "All expenses", columns.length);
    addSummary(
      worksheet,
      [
        { label: "Active Expense Total", value: activeTotal, format: currencyFormat },
        {
          label: "Cancelled Expense Total",
          value: cancelledTotal,
          format: currencyFormat,
        },
        { label: "Total Records", value: expenses.length },
        { label: "Generated At", value: new Date(), format: dateFormat },
      ],
      4
    );
    addReportTable(
      worksheet,
      "ExpenseReport",
      columns,
      expenses.map((expense, index) => ({
        serial: index + 1,
        title: expense.title,
        amount: Number(expense.amount),
        status: expense.status,
        description: expense.description ?? "",
        createdAt: expense.createdAt,
      })),
      10
    );
    finishWorksheet(worksheet);

    return workbook.xlsx.writeBuffer();
  },

  unpaidMembersExcel: async (month: string) => {
    const workbook = createWorkbook("Unpaid Members Report");
    const worksheet = workbook.addWorksheet("Unpaid Members");

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

    const columns: ReportColumn[] = [
      { header: "#", key: "serial", width: 8 },
      { header: "Name", key: "name", width: 28 },
      { header: "Email", key: "email", width: 36 },
      { header: "Role", key: "role", width: 16 },
      { header: "Month", key: "month", width: 14 },
      { header: "Payment Status", key: "paymentStatus", width: 18 },
    ];

    addReportHeader(worksheet, "Unpaid Members Report", month, columns.length);
    addSummary(
      worksheet,
      [
        { label: "Report Month", value: month },
        { label: "Active Members", value: activeMembers.length },
        { label: "Paid Members", value: paidUserIds.size },
        { label: "Unpaid Members", value: unpaidMembers.length },
        {
          label: "Collection Rate",
          value:
            activeMembers.length > 0
              ? paidUserIds.size / activeMembers.length
              : 0,
          format: "0.00%",
        },
      ],
      4
    );
    addReportTable(
      worksheet,
      "UnpaidMembers",
      columns,
      unpaidMembers.map((member, index) => ({
        serial: index + 1,
        name: member.name,
        email: member.email,
        role: member.role,
        month,
        paymentStatus: "UNPAID",
      })),
      11
    );
    finishWorksheet(worksheet);

    return workbook.xlsx.writeBuffer();
  },
};
