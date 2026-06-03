import { Router } from "express";
import { Role } from "../../generated/prisma/enums.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { roleMiddleware } from "../../middlewares/role.middleware.js";
import { validateRequest } from "../../middlewares/validateRequest.middleware.js";
import { monthQuerySchema } from "../reports/report.validation.js";
import { exportController } from "./export.controller.js";

const router = Router();

router.use(authMiddleware);

router.get(
  "/monthly-collection",
  roleMiddleware(Role.PRESIDENT, Role.ACCOUNTANT),
  validateRequest(monthQuerySchema),
  exportController.monthlyCollectionExcel
);

router.get(
  "/expenses",
  roleMiddleware(Role.PRESIDENT, Role.ACCOUNTANT),
  exportController.expenseExcel
);

router.get(
  "/unpaid-members",
  roleMiddleware(Role.PRESIDENT, Role.ACCOUNTANT, Role.COORDINATOR),
  validateRequest(monthQuerySchema),
  exportController.unpaidMembersExcel
);

export const exportRoutes = router;