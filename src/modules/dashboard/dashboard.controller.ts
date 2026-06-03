import type { RequestHandler } from "express";
import { sendResponse } from "../../common/utils/sendResponse.js";
import { dashboardService } from "./dashboard.service.js";

export const dashboardController = {
  president: (async (_req, res, next) => {
    try {
      const result = await dashboardService.getPresidentDashboard();

      sendResponse({
        res,
        statusCode: 200,
        message: "President dashboard fetched successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler,

  accountant: (async (_req, res, next) => {
    try {
      const result = await dashboardService.getAccountantDashboard();

      sendResponse({
        res,
        statusCode: 200,
        message: "Accountant dashboard fetched successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler,

  coordinator: (async (_req, res, next) => {
    try {
      const result = await dashboardService.getCoordinatorDashboard();

      sendResponse({
        res,
        statusCode: 200,
        message: "Coordinator dashboard fetched successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler,

  member: (async (req, res, next) => {
    try {
      const result = await dashboardService.getMemberDashboard(req.user!.id);

      sendResponse({
        res,
        statusCode: 200,
        message: "Member dashboard fetched successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler,
};