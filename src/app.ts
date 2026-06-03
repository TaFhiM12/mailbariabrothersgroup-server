import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { globalErrorHandler } from "./middlewares/error.middleware.js";
import { appRoutes } from "./routes/index.js";

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    credentials: true,
  })
);

app.use(express.json({ limit: "10kb" }));

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: "Too many requests, please try again later",
    },
  })
);

app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "Club Savings API",
  });
});

app.get("/health", (_req, res) => {
  res.json({
    success: true,
    status: "healthy",
  });
});

app.use("/api/v1", appRoutes);

app.use(globalErrorHandler);

export default app;