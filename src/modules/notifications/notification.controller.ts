import type { RequestHandler } from "express";
import { sendResponse } from "../../common/utils/sendResponse.js";
import { notificationService } from "./notification.service.js";

export const notificationController = {
  getMyNotifications: (async (req, res, next) => {
    try {
      const result = await notificationService.getMyNotifications(req.user!.id);

      sendResponse({
        res,
        statusCode: 200,
        message: "Notifications fetched successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler,

  getMyUnreadCount: (async (req, res, next) => {
    try {
      const result = await notificationService.getMyUnreadCount(req.user!.id);

      sendResponse({
        res,
        statusCode: 200,
        message: "Unread notification count fetched successfully",
        data: {
          unreadCount: result,
        },
      });
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler,

  markAsRead: (async (req, res, next) => {
    try {
      const result = await notificationService.markAsRead(
        req.params.id as string,
        req.user!.id
      );

      sendResponse({
        res,
        statusCode: 200,
        message: "Notification marked as read",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler,

  markAllAsRead: (async (req, res, next) => {
    try {
      const result = await notificationService.markAllAsRead(req.user!.id);

      sendResponse({
        res,
        statusCode: 200,
        message: "All notifications marked as read",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler,
};