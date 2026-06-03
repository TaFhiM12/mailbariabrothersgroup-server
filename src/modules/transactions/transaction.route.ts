import { Router } from "express";
import { Role } from "../../generated/prisma/enums.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { roleMiddleware } from "../../middlewares/role.middleware.js";
import { validateRequest } from "../../middlewares/validateRequest.middleware.js";
import { transactionController } from "./transaction.controller.js";
import { createTransactionSchema } from "./transaction.validation.js";

const router = Router();

router.use(authMiddleware);

router.get("/my", transactionController.getMyTransactions);

router.get(
  "/",
  roleMiddleware(Role.PRESIDENT, Role.ACCOUNTANT),
  transactionController.getAllTransactions
);

router.post(
  "/",
  roleMiddleware(Role.PRESIDENT, Role.ACCOUNTANT),
  validateRequest(createTransactionSchema),
  transactionController.createTransaction
);

export const transactionRoutes = router;