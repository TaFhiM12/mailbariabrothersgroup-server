import { Router } from "express";
import { Role } from "../../generated/prisma/enums.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { roleMiddleware } from "../../middlewares/role.middleware.js";
import { dashboardController } from "./dashboard.controller.js";

const router = Router();

router.use(authMiddleware);

router.get(
  "/president",
  roleMiddleware(Role.PRESIDENT),
  dashboardController.president
);

router.get(
  "/accountant",
  roleMiddleware(Role.PRESIDENT, Role.ACCOUNTANT),
  dashboardController.accountant
);

router.get(
  "/coordinator",
  roleMiddleware(Role.PRESIDENT, Role.COORDINATOR),
  dashboardController.coordinator
);

router.get("/member", dashboardController.member);

export const dashboardRoutes = router;