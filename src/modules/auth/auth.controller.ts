import type { RequestHandler } from "express";
import { sendResponse } from "../../common/utils/sendResponse.js";
import { authService } from "./auth.service.js";

export const authController = {
  register: (async (req, res, next) => {
    try {
      const result = await authService.register(req.body);

      sendResponse({
        res,
        statusCode: 201,
        message: "User registered successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler,

  login: (async (req, res, next) => {
    try {
      const result = await authService.login(req.body);

      sendResponse({
        res,
        statusCode: 200,
        message: "Login successful",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler,

  me: (async (req, res, next) => {
    try {
      sendResponse({
        res,
        statusCode: 200,
        message: "Profile fetched successfully",
        data: req.user,
      });
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler,
};