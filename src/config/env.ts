import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  PORT: z.coerce.number().default(5000),

  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  JWT_SECRET: z.string().min(
    20,
    "JWT_SECRET must be at least 20 characters"
  ),

  JWT_EXPIRES_IN: z.string().default("7d"),

  BCRYPT_SALT_ROUNDS: z.coerce.number().default(12),

  CRON_SECRET: z.string().min(
    20,
    "CRON_SECRET must be at least 20 characters"
  ),

  EMAIL_HOST: z.string().default("smtp.gmail.com"),

  EMAIL_PORT: z.coerce.number().default(587),

  EMAIL_SECURE: z
    .string()
    .default("false")
    .transform((value) => value === "true"),

  EMAIL_USER: z.email("EMAIL_USER must be valid email"),

  EMAIL_PASS: z.string().min(1, "EMAIL_PASS is required"),

  EMAIL_FROM: z.string().min(1, "EMAIL_FROM is required"),

  CLIENT_URL: z.string().default("http://localhost:3000"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error(
    "Invalid environment variables:",
    parsedEnv.error.flatten().fieldErrors
  );
  process.exit(1);
}

export const env = parsedEnv.data;