import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_NAME: z.string().default("Faculty Management System"),
  APP_URL: z.string().url().default("http://localhost:3000"),

  // Database Connection
  DATABASE_URL: z
    .string()
    .min(1, "DATABASE_URL is required")
    .refine(
      (url) => url.startsWith("mysql://") || url.startsWith("mariadb://"),
      "DATABASE_URL must be a valid mysql:// or mariadb:// connection URL"
    )
    .default("mysql://fms_user:fms_password@127.0.0.1:3306/fms_db"),

  USE_PRISMA_MARIADB_ADAPTER: z
    .string()
    .transform((val) => val === "true")
    .default("false"),

  DB_HOST: z.string().default("127.0.0.1"),
  DB_PORT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default("3306"),
  DB_USER: z.string().default("fms_user"),
  DB_PASSWORD: z.string().optional().default(""),
  DB_NAME: z.string().default("fms_db"),

  // Authentication
  AUTH_SECRET: z
    .string()
    .min(16, "AUTH_SECRET must be at least 16 characters for cryptographic signing")
    .default("development-auth-secret-key-change-in-production"),
  AUTH_TRUST_HOST: z
    .string()
    .transform((val) => val === "true")
    .default("true"),

  // Storage
  MEDIA_STORAGE_ROOT: z.string().default("./storage/uploads"),
  MAX_UPLOAD_SIZE_MB: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default("25"),

  // Logging
  LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("info"),
});

export type Env = z.infer<typeof envSchema>;

function parseEnv(): Env {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error("❌ Invalid environment variables:", result.error.flatten().fieldErrors);
    // In build or test without real env, return default-fallback schema to allow static verification
    return envSchema.parse({
      ...process.env,
      DATABASE_URL: process.env.DATABASE_URL || "mysql://fms_user:fms_pass@127.0.0.1:3306/fms_db",
      AUTH_SECRET:
        process.env.AUTH_SECRET || "development-auth-secret-key-change-in-production-min32bytes",
    });
  }
  return result.data;
}

export const env = parseEnv();
