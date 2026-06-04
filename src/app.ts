import express, { type RequestHandler } from "express";
import cors from "cors";
import helmetPkg from "helmet";
import { rateLimit } from "express-rate-limit";
import { globalErrorHandler } from "./middlewares/error.middleware.js";
import { appRoutes } from "./routes/index.js";

const app = express();

const helmet = helmetPkg as unknown as () => RequestHandler;
app.use(helmet());

const normalizeOrigin = (origin: string) => origin.replace(/\/$/, "");

const allowedOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .map(normalizeOrigin)
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins.length === 0 ||
        allowedOrigins.includes(normalizeOrigin(origin))
      ) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "10kb" }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again later",
  },
});

app.use(limiter);

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
