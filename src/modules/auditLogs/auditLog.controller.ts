import type { RequestHandler } from "express";
import { sendResponse } from "../../common/utils/sendResponse.js";
import { auditLogService } from "./auditLog.service.js";

export const auditLogController = {
  getAllAuditLogs: (async (_req, res, next) => {
    try {
      const result = await auditLogService.getAllAuditLogs();

      sendResponse({
        res,
        statusCode: 200,
        message: "Audit logs fetched successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler,
};