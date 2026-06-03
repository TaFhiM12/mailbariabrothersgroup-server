import type { RequestHandler } from "express";
import { sendResponse } from "../../common/utils/sendResponse.js";
import { reminderService } from "./reminder.service.js";

export const reminderController = {
  createMonthlyReminders: (async (req, res, next) => {
    try {
      const result = await reminderService.createMonthlyReminders(req.body);

      sendResponse({
        res,
        statusCode: 201,
        message: "Monthly reminders created successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler,

  getAllReminders: (async (_req, res, next) => {
    try {
      const result = await reminderService.getAllReminders();

      sendResponse({
        res,
        statusCode: 200,
        message: "Reminders fetched successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler,

  getMyReminders: (async (req, res, next) => {
    try {
      const result = await reminderService.getMyReminders(req.user!.id);

      sendResponse({
        res,
        statusCode: 200,
        message: "My reminders fetched successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler,
};