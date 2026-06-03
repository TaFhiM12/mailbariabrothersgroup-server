import type { RequestHandler } from "express";
import { sendResponse } from "../../common/utils/sendResponse.js";
import { reportService } from "./report.service.js";

export const reportController = {
  monthlyCollectionReport: (async (req, res, next) => {
    try {
      const result = await reportService.monthlyCollectionReport(
        req.query.month as string
      );

      sendResponse({
        res,
        statusCode: 200,
        message: "Monthly collection report fetched successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler,

  monthlyExpenseReport: (async (req, res, next) => {
    try {
      const result = await reportService.monthlyExpenseReport(
        req.query.month as string
      );

      sendResponse({
        res,
        statusCode: 200,
        message: "Monthly expense report fetched successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler,

  unpaidMembersReport: (async (req, res, next) => {
    try {
      const result = await reportService.unpaidMembersReport(
        req.query.month as string
      );

      sendResponse({
        res,
        statusCode: 200,
        message: "Unpaid members report fetched successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler,

  memberSavingsReport: (async (req, res, next) => {
    try {
      const result = await reportService.memberSavingsReport(req.params.userId as string);

      sendResponse({
        res,
        statusCode: 200,
        message: "Member savings report fetched successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler,

  clubFinancialSummary: (async (_req, res, next) => {
    try {
      const result = await reportService.clubFinancialSummary();

      sendResponse({
        res,
        statusCode: 200,
        message: "Club financial summary fetched successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler,
};