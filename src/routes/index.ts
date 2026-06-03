import { Router } from "express";
import { authRoutes } from "../modules/auth/auth.route.js";
import { userRoutes } from "../modules/users/user.route.js";
import { savingRoutes } from "../modules/savings/saving.route.js";
import { transactionRoutes } from "../modules/transactions/transaction.route.js";
import { noticeRoutes } from "../modules/notices/notice.route.js";
import { reminderRoutes } from "../modules/reminders/reminder.route.js";
import { cronRoutes } from "../modules/cron/cron.router.js";
import { notificationRoutes } from "../modules/notifications/notification.route.js";
import { expenseRoutes } from "../modules/expenses/expense.route.js";
import { dashboardRoutes } from "../modules/dashboard/dashboard.route.js";
import { reportRoutes } from "../modules/reports/report.route.js";
import { auditLogRoutes } from "../modules/auditLogs/auditLog.route.js";
import { activityFeedRoutes } from "../modules/activityFeed/activityFeed.route.js";
import { settingRoutes } from "../modules/settings/setting.route.js";
import { exportRoutes } from "../modules/exports/export.route.js";
import { pdfExportRoutes } from "../modules/pdfExports/pdfExport.route.js";



const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/savings", savingRoutes);
router.use("/transactions", transactionRoutes);
router.use("/notices", noticeRoutes);
router.use("/reminders", reminderRoutes);
router.use("/cron", cronRoutes);
router.use("/notifications", notificationRoutes);
router.use("/expenses", expenseRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/reports", reportRoutes);
router.use("/audit-logs", auditLogRoutes);
router.use("/activity-feed", activityFeedRoutes);
router.use("/settings", settingRoutes);
router.use("/exports", exportRoutes);
router.use("/pdf-exports", pdfExportRoutes);

export const appRoutes = router;