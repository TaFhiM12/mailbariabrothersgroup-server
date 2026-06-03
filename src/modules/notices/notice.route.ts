import { Router } from "express";
import { Role } from "../../generated/prisma/enums.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { roleMiddleware } from "../../middlewares/role.middleware.js";
import { validateRequest } from "../../middlewares/validateRequest.middleware.js";
import {
  createNoticeSchema,
  updateNoticeSchema,
} from "./notice.validation.js";
import { noticeController } from "./notice.controller.js";

const router = Router();

router.use(authMiddleware);

router.get("/", noticeController.getAllNotices);
router.get("/:id", noticeController.getSingleNotice);

router.post(
  "/",
  roleMiddleware(Role.PRESIDENT, Role.COORDINATOR),
  validateRequest(createNoticeSchema),
  noticeController.createNotice
);

router.patch(
  "/:id",
  roleMiddleware(Role.PRESIDENT, Role.COORDINATOR),
  validateRequest(updateNoticeSchema),
  noticeController.updateNotice
);

router.delete(
  "/:id",
  roleMiddleware(Role.PRESIDENT),
  noticeController.deleteNotice
);

export const noticeRoutes = router;