import { Router } from "express";
import { Role } from "../../generated/prisma/enums.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { roleMiddleware } from "../../middlewares/role.middleware.js";
import { validateRequest } from "../../middlewares/validateRequest.middleware.js";
import {
  createSavingSchema,
  updateSavingDecisionSchema,
} from "./saving.validation.js";
import { savingController } from "./saving.controller.js";

const router = Router();

router.use(authMiddleware);

router.post(
  "/",
  validateRequest(createSavingSchema),
  savingController.createSaving
);

router.get("/my", savingController.getMySavings);

router.get(
  "/",
  roleMiddleware(Role.PRESIDENT, Role.ACCOUNTANT),
  savingController.getAllSavings
);

router.patch(
  "/:id/approve",
  roleMiddleware(Role.PRESIDENT, Role.ACCOUNTANT),
  validateRequest(updateSavingDecisionSchema),
  savingController.approveSaving
);

router.patch(
  "/:id/reject",
  roleMiddleware(Role.PRESIDENT, Role.ACCOUNTANT),
  validateRequest(updateSavingDecisionSchema),
  savingController.rejectSaving
);

export const savingRoutes = router;