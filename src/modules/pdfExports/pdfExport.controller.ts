import type { RequestHandler } from "express";
import { pdfExportService } from "./pdfExport.service.js";

const sendPdf = (
  res: Parameters<RequestHandler>[1],
  filename: string,
  buffer: Buffer
) => {
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.send(buffer);
};

export const pdfExportController = {
  monthlyCollectionPdf: (async (req, res, next) => {
    try {
      const month = req.query.month as string;

      const buffer = await pdfExportService.monthlyCollectionPdf(month);

      sendPdf(res, `monthly-collection-${month}.pdf`, buffer);
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler,

  expensesPdf: (async (_req, res, next) => {
    try {
      const buffer = await pdfExportService.expensesPdf();

      sendPdf(res, "expenses.pdf", buffer);
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler,

  unpaidMembersPdf: (async (req, res, next) => {
    try {
      const month = req.query.month as string;

      const buffer = await pdfExportService.unpaidMembersPdf(month);

      sendPdf(res, `unpaid-members-${month}.pdf`, buffer);
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler,

  financialSummaryPdf: (async (_req, res, next) => {
    try {
      const buffer = await pdfExportService.financialSummaryPdf();

      sendPdf(res, "club-financial-summary.pdf", buffer);
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler,
};