/**
 * JWT private key and expiration date
 */

import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().default(3000),

  DATABASE_URL: z.string().url(),

  RESEND_API_KEY: z.string().min(1),
  SYSTEM_MAIL_ADDR: z.string().email(),

  JWT_SECRET: z.string().min(16),
  JWT_EXPIRATION: z.string().default("15m"),
  JWT_SECRET_REFRESH: z.string().min(16).optional(),
  REFRESH_SECRET: z.string().min(16).optional(),

  BUCKET_NAME: z.string().min(1),
  BUCKET_ACCESS_KEY: z.string().min(1),
  BUCKET_SECRET_KEY: z.string().min(1),
  BUCKET_URL: z.string().url(),
  BUCKET_REGION: z.string().min(1),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error("❌ Variáveis de ambiente inválidas:\n");
    const errors = result.error.flatten().fieldErrors;
    for (const [key, messages] of Object.entries(errors)) {
      console.error(`  ${key}:`);
      messages?.forEach((msg) => console.error(`    - ${msg}`));
    }
    // Lançamos um erro em vez de usar process.exit(1) para que a Vercel consiga capturar e exibir o log corretamente.
    throw new Error("Variáveis de ambiente inválidas. Verifique os logs acima para mais detalhes.");
  }

  return result.data;
}
const validated = validateEnv();

export const env = {
  ...validated,
  isDev: validated.NODE_ENV === "development",
};
