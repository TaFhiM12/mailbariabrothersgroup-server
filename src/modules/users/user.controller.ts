import type { RequestHandler } from "express";
import { sendResponse } from "../../common/utils/sendResponse.js";
import { userService } from "./user.service.js";

export const userController = {
  updateMyProfile: (async (req, res, next) => {
    try {
      const result = await userService.updateMyProfile(req.user!.id, req.body);

      sendResponse({
        res,
        statusCode: 200,
        message: "Profile updated successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler,

  getAllUsers: (async (_req, res, next) => {
    try {
      const result = await userService.getAllUsers();

      sendResponse({
        res,
        statusCode: 200,
        message: "Users fetched successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler,

  getSingleUser: (async (req, res, next) => {
    try {
      const result = await userService.getSingleUser(req.params.id as string);

      sendResponse({
        res,
        statusCode: 200,
        message: "User fetched successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler,

  updateUserRole: (async (req, res, next) => {
    try {
      const result = await userService.updateUserRole(
        req.params.id as string,
        req.body.role,
        req.user!.id
      );

      sendResponse({
        res,
        statusCode: 200,
        message: "User role updated successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler,

  updateUserStatus: (async (req, res, next) => {
    try {
      const result = await userService.updateUserStatus(
        req.params.id as string,
        req.body.isActive,
        req.user!.id
      );

      sendResponse({
        res,
        statusCode: 200,
        message: "User status updated successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler,
};
