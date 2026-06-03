import { Router } from "express";
import { Role } from "../../generated/prisma/enums.js";
import { userController } from "./user.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { roleMiddleware } from "../../middlewares/role.middleware.js";
import { validateRequest } from "../../middlewares/validateRequest.middleware.js";
import {
  updateUserRoleSchema,
  updateUserStatusSchema,
} from "./user.validation.js";

const router = Router();

router.use(authMiddleware);

router.get(
  "/",
  roleMiddleware(Role.PRESIDENT, Role.COORDINATOR),
  userController.getAllUsers
);

router.get(
  "/:id",
  roleMiddleware(Role.PRESIDENT, Role.COORDINATOR),
  userController.getSingleUser
);

router.patch(
  "/:id/role",
  roleMiddleware(Role.PRESIDENT),
  validateRequest(updateUserRoleSchema),
  userController.updateUserRole
);

router.patch(
  "/:id/status",
  roleMiddleware(Role.PRESIDENT),
  validateRequest(updateUserStatusSchema),
  userController.updateUserStatus
);

export const userRoutes = router;