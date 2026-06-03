import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { activityFeedController } from "./activityFeed.controller.js";

const router = Router();

router.use(authMiddleware);

router.get(
  "/",
  activityFeedController.getRecentActivities
);

export const activityFeedRoutes = router;