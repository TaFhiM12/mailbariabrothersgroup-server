import type { RequestHandler } from "express";
import { sendResponse } from "../../common/utils/sendResponse.js";
import { noticeService } from "./notice.service.js";

export const noticeController = {
  createNotice: (async (req, res, next) => {
    try {
      const result = await noticeService.createNotice(req.user!.id, req.body);

      sendResponse({
        res,
        statusCode: 201,
        message: "Notice created successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler,

  getAllNotices: (async (_req, res, next) => {
    try {
      const result = await noticeService.getAllNotices();

      sendResponse({
        res,
        statusCode: 200,
        message: "Notices fetched successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler,

  getSingleNotice: (async (req, res, next) => {
    try {
      const result = await noticeService.getSingleNotice(req.params.id as string);

      sendResponse({
        res,
        statusCode: 200,
        message: "Notice fetched successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler,

  updateNotice: (async (req, res, next) => {
    try {
      const result = await noticeService.updateNotice(req.params.id as string, req.body);

      sendResponse({
        res,
        statusCode: 200,
        message: "Notice updated successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler,

  deleteNotice: (async (req, res, next) => {
    try {
      await noticeService.deleteNotice(req.params.id as string);

      sendResponse({
        res,
        statusCode: 200,
        message: "Notice deleted successfully",
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler,
};