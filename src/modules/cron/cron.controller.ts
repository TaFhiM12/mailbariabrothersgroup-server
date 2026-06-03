import type { RequestHandler } from "express";
import { env } from "../../config/env.js";
import { AppError } from "../../common/errors/AppError.js";
import { sendResponse } from "../../common/utils/sendResponse.js";
import { reminderService } from "../reminders/reminder.service.js";

export const cronController = {
  monthlyPaymentReminder: (async (req, res, next) => {
    try {
      const secret = req.headers["x-cron-secret"];

      if (secret !== env.CRON_SECRET) {
        throw new AppError(401, "Invalid cron secret");
      }

      const result = await reminderService.createAutomaticMonthlyReminders();

      sendResponse({
        res,
        statusCode: 200,
        message: "Automatic monthly reminders processed successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler,
};