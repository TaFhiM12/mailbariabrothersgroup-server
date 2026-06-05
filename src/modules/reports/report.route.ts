import { Router } from "express";
import { Role } from "../../generated/prisma/enums.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { roleMiddleware } from "../../middlewares/role.middleware.js";
import { validateRequest } from "../../middlewares/validateRequest.middleware.js";
import { reportController } from "./report.controller.js";
import { memberReportSchema, monthQuerySchema } from "./report.validation.js";

const router = Router();

router.use(authMiddleware);

router.get(
  "/monthly-collection",
  roleMiddleware(Role.PRESIDENT, Role.ACCOUNTANT),
  validateRequest(monthQuerySchema),
  reportController.monthlyCollectionReport
);

router.get(
  "/monthly-expenses",
  roleMiddleware(Role.PRESIDENT, Role.ACCOUNTANT),
  validateRequest(monthQuerySchema),
  reportController.monthlyExpenseReport
);

router.get(
  "/unpaid-members",
  roleMiddleware(Role.PRESIDENT, Role.ACCOUNTANT, Role.COORDINATOR),
  validateRequest(monthQuerySchema),
  reportController.unpaidMembersReport
);

router.get(
  "/member-savings/:userId",
  roleMiddleware(Role.PRESIDENT, Role.ACCOUNTANT, Role.COORDINATOR),
  validateRequest(memberReportSchema),
  reportController.memberSavingsReport
);

router.get(
  "/club-financial-summary",
  roleMiddleware(Role.PRESIDENT, Role.ACCOUNTANT),
  reportController.clubFinancialSummary
);

export const reportRoutes = router;
