import type { RequestHandler } from "express";
import { sendResponse } from "../../common/utils/sendResponse.js";
import { activityFeedService } from "./activityFeed.service.js";

export const activityFeedController = {
  getRecentActivities: (async (_req, res, next) => {
    try {
      const result =
        await activityFeedService.getRecentActivities();

      sendResponse({
        res,
        statusCode: 200,
        message: "Recent activities fetched successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler,
};