import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { notificationController } from "./notification.controller.js";

const router = Router();

router.use(authMiddleware);

router.get("/my", notificationController.getMyNotifications);
router.get("/my/unread-count", notificationController.getMyUnreadCount);

router.patch("/:id/read", notificationController.markAsRead);
router.patch("/read-all", notificationController.markAllAsRead);

export const notificationRoutes = router;