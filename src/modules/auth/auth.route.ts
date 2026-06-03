import { Router } from "express";
import { authController } from "./auth.controller.js";
import { validateRequest } from "../../middlewares/validateRequest.middleware.js";
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "./auth.validation.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";

const router = Router();

router.post(
  "/register",
  validateRequest(registerSchema),
  authController.register
);

router.post(
  "/login",
  validateRequest(loginSchema),
  authController.login
);

router.post(
  "/forgot-password",
  validateRequest(forgotPasswordSchema),
  authController.forgotPassword
);

router.post(
  "/reset-password",
  validateRequest(resetPasswordSchema),
  authController.resetPassword
);

router.get(
  "/me",
  authMiddleware,
  authController.me
);

router.post(
  "/logout",
  authMiddleware,
  authController.logout
);

export const authRoutes = router;