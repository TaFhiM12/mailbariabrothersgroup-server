import type { RequestHandler } from "express";
import { sendResponse } from "../../common/utils/sendResponse.js";
import { settingService } from "./setting.service.js";

export const settingController = {
  getSettings: (async (_req, res, next) => {
    try {
      const result = await settingService.getSettings();

      sendResponse({
        res,
        statusCode: 200,
        message: "Settings fetched successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler,

  updateSettings: (async (req, res, next) => {
    try {
      const result = await settingService.updateSettings(req.body);

      sendResponse({
        res,
        statusCode: 200,
        message: "Settings updated successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler,
};