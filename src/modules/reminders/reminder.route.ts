import { Router } from "express";
import { Role } from "../../generated/prisma/enums.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { roleMiddleware } from "../../middlewares/role.middleware.js";
import { validateRequest } from "../../middlewares/validateRequest.middleware.js";
import { createMonthlyReminderSchema } from "./reminder.validation.js";
import { reminderController } from "./reminder.controller.js";

const router = Router();

router.use(authMiddleware);

router.get("/my", reminderController.getMyReminders);

router.get(
  "/",
  roleMiddleware(Role.PRESIDENT, Role.ACCOUNTANT),
  reminderController.getAllReminders
);

router.post(
  "/monthly",
  roleMiddleware(Role.PRESIDENT, Role.ACCOUNTANT),
  validateRequest(createMonthlyReminderSchema),
  reminderController.createMonthlyReminders
);

export const reminderRoutes = router;