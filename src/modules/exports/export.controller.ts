import type { RequestHandler } from "express";
import { exportService } from "./export.service.js";
import type ExcelJS from "exceljs";

const sendExcel = (
  res: Parameters<RequestHandler>[1],
  filename: string,
  buffer: ExcelJS.Buffer
) => {
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );

  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${filename}"`
  );

  res.send(buffer);
};

export const exportController = {
  monthlyCollectionExcel: (async (req, res, next) => {
    try {
      const month = req.query.month as string;

      const buffer = await exportService.monthlyCollectionExcel(month);

      sendExcel(res, `monthly-collection-${month}.xlsx`, buffer);
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler,

  expenseExcel: (async (_req, res, next) => {
    try {
      const buffer = await exportService.expenseExcel();

      sendExcel(res, "expenses.xlsx", buffer);
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler,

  unpaidMembersExcel: (async (req, res, next) => {
    try {
      const month = req.query.month as string;

      const buffer = await exportService.unpaidMembersExcel(month);

      sendExcel(res, `unpaid-members-${month}.xlsx`, buffer);
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler,
};