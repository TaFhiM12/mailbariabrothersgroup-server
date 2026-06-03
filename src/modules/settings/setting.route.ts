import { Router } from "express";
import { Role } from "../../generated/prisma/enums.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { roleMiddleware } from "../../middlewares/role.middleware.js";
import { validateRequest } from "../../middlewares/validateRequest.middleware.js";
import { settingController } from "./setting.controller.js";
import { updateSettingSchema } from "./setting.validation.js";

const router = Router();

router.use(authMiddleware);

router.get("/", settingController.getSettings);

router.patch(
  "/",
  roleMiddleware(Role.PRESIDENT),
  validateRequest(updateSettingSchema),
  settingController.updateSettings
);

export const settingRoutes = router;