import type { RequestHandler } from "express";
import { sendResponse } from "../../common/utils/sendResponse.js";
import { transactionService } from "./transaction.service.js";

export const transactionController = {
  createTransaction: (async (req, res, next) => {
    try {
      const result = await transactionService.createTransaction(req.body);

      sendResponse({
        res,
        statusCode: 201,
        message: "Transaction created successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler,

  getMyTransactions: (async (req, res, next) => {
    try {
      const result = await transactionService.getMyTransactions(req.user!.id);

      sendResponse({
        res,
        statusCode: 200,
        message: "My transactions fetched successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler,

  getAllTransactions: (async (_req, res, next) => {
    try {
      const result = await transactionService.getAllTransactions();

      sendResponse({
        res,
        statusCode: 200,
        message: "All transactions fetched successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler,
};