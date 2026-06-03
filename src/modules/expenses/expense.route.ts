import { Router } from "express";
import { Role } from "../../generated/prisma/enums.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { roleMiddleware } from "../../middlewares/role.middleware.js";
import { validateRequest } from "../../middlewares/validateRequest.middleware.js";
import {
  createExpenseSchema,
  updateExpenseSchema,
} from "./expense.validation.js";
import { expenseController } from "./expense.controller.js";

const router = Router();

router.use(authMiddleware);

router.get("/", expenseController.getAllExpenses);
router.get("/:id", expenseController.getSingleExpense);

router.post(
  "/",
  roleMiddleware(Role.PRESIDENT, Role.ACCOUNTANT),
  validateRequest(createExpenseSchema),
  expenseController.createExpense
);

router.patch(
  "/:id",
  roleMiddleware(Role.PRESIDENT, Role.ACCOUNTANT),
  validateRequest(updateExpenseSchema),
  expenseController.updateExpense
);

router.patch(
  "/:id/cancel",
  roleMiddleware(Role.PRESIDENT),
  expenseController.cancelExpense
);

export const expenseRoutes = router;