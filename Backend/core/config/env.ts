import "dotenv/config";
import { z } from "zod";

const isTestEnv = process.env.NODE_ENV === "test";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(3001),
  PUBLIC_PORT: z.coerce.number().optional(),
  CORS_ORIGIN: z.string().default("*"),

  DATABASE_URL: z.string().min(1).optional(),
  DB_HOST: z.string().default("localhost"),
  DB_PORT: z.coerce.number().default(5432),
  DB_USER: z.string().default("postgres"),
  DB_PASSWORD: z.string().default("postgres"),
  DB_NAME: z.string().default("black_amber_db"),
  DB_SSL: z
    .string()
    .optional()
    .transform((v) => v === "true"),
  AUTO_SEED: z
    .string()
    .optional()
    .transform((v) => v !== "false"),

  JWT_SECRET: z
    .string()
    .min(16, "JWT_SECRET deve ter pelo menos 16 caracteres.")
    .default(isTestEnv ? "test_jwt_secret_at_least_16chars" : "black_amber_fallback_jwt_secret_16"),
  JWT_EXPIRATION: z.string().default("15m"),
  JWT_SECRET_REFRESH: z.string().min(16).optional(),
  REFRESH_SECRET: z.string().min(16).optional(),

  BUCKET_NAME: z.preprocess(
    (v) => (isTestEnv ? undefined : v),
    z.string().default(isTestEnv ? "test-bucket" : ""),
  ),
  BUCKET_ACCESS_KEY: z.preprocess(
    (v) => (isTestEnv ? undefined : v),
    z.string().default(isTestEnv ? "test-access-key" : ""),
  ),
  BUCKET_SECRET_KEY: z.preprocess(
    (v) => (isTestEnv ? undefined : v),
    z.string().default(isTestEnv ? "test-secret-key" : ""),
  ),
  BUCKET_URL: z.preprocess(
    (v) => (isTestEnv ? undefined : v),
    z.string().default(isTestEnv ? "http://localhost:9000" : ""),
  ),
  BUCKET_PUBLIC_URL: z.preprocess(
    (v) => (isTestEnv ? undefined : v),
    z.string().default(""),
  ),
  BUCKET_REGION: z.string().default("us-east-1"),

  RESEND_API_KEY: z.string().default(isTestEnv ? "re_test_key" : ""),
  SYSTEM_MAIL_ADDR: z.string().default(isTestEnv ? "test@blackamber.com" : "onboarding@resend.dev"),
});

export type EnvConfig = z.infer<typeof envSchema> & {
  DATABASE_URL: string;
  isDev: boolean;
  isTest: boolean;
  corsOrigins: string[] | "*";
};

function validateEnv(): EnvConfig {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error("[Env] Variáveis de ambiente inválidas:", parsed.error.flatten().fieldErrors);
    throw new Error("Variáveis de ambiente inválidas. Verifique a configuração do servidor.");
  }

  const data = parsed.data;
  const databaseUrl =
    data.DATABASE_URL ||
    `postgresql://${encodeURIComponent(data.DB_USER)}:${encodeURIComponent(data.DB_PASSWORD)}@${data.DB_HOST}:${data.DB_PORT}/${data.DB_NAME}`;

  const corsOrigins =
    data.CORS_ORIGIN.trim() === "*" || data.CORS_ORIGIN.trim() === ""
      ? "*"
      : data.CORS_ORIGIN.split(",")
          .map((origin) => origin.trim())
          .filter(Boolean);

  return {
    ...data,
    DATABASE_URL: databaseUrl,
    isDev: data.NODE_ENV === "development",
    isTest: data.NODE_ENV === "test",
    corsOrigins,
  };
}

export const env = validateEnv();
