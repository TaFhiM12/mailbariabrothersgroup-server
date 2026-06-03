import type { RequestHandler } from "express";
import { sendResponse } from "../../common/utils/sendResponse.js";
import { expenseService } from "./expense.service.js";

export const expenseController = {
  createExpense: (async (req, res, next) => {
    try {
      const result = await expenseService.createExpense(req.user!.id, req.body);

      sendResponse({
        res,
        statusCode: 201,
        message: "Expense created successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler,

  getAllExpenses: (async (_req, res, next) => {
    try {
      const result = await expenseService.getAllExpenses();

      sendResponse({
        res,
        statusCode: 200,
        message: "Expenses fetched successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler,

  getSingleExpense: (async (req, res, next) => {
    try {
      const result = await expenseService.getSingleExpense(req.params.id as string);

      sendResponse({
        res,
        statusCode: 200,
        message: "Expense fetched successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler,

  updateExpense: (async (req, res, next) => {
    try {
      const result = await expenseService.updateExpense(req.params.id as string, req.body);

      sendResponse({
        res,
        statusCode: 200,
        message: "Expense updated successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler,

  cancelExpense: (async (req, res, next) => {
    try {
      const result = await expenseService.cancelExpense(
        req.params.id as string,
        req.user!.id
      );

      sendResponse({
        res,
        statusCode: 200,
        message: "Expense cancelled successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler,
};