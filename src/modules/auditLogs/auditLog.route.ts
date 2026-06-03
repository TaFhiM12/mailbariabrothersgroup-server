import { Router } from "express";
import { Role } from "../../generated/prisma/enums.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { roleMiddleware } from "../../middlewares/role.middleware.js";
import { auditLogController } from "./auditLog.controller.js";

const router = Router();

router.use(authMiddleware);

router.get(
  "/",
  roleMiddleware(Role.PRESIDENT),
  auditLogController.getAllAuditLogs
);

export const auditLogRoutes = router;