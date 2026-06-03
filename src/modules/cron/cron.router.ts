import { Router } from "express";
import { cronController } from "./cron.controller.js";

const router = Router();

router.get("/monthly-payment-reminder", cronController.monthlyPaymentReminder);

export const cronRoutes = router;