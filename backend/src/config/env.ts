import dotenv from "dotenv";
import { z } from "zod";

dotenv.config({ path: "../.env" });
dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  PORT: z.coerce.number().int().positive().default(4000),
  FRONTEND_URL: z.string().url(),
  OPEN_FOOD_FACTS_BASE_URL: z.string().url().default("https://world.openfoodfacts.org"),
  DEMO_USER_EMAIL: z.string().email(),
  DEMO_USER_NAME: z.string().min(1).default("Demo User"),
  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().min(1),
  STRIPE_PRICE_ID: z.string().min(1),
  STRIPE_SUCCESS_PATH: z.string().min(1).default("/subscription/success"),
  STRIPE_CANCEL_PATH: z.string().min(1).default("/subscription/cancel"),
});

export type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

export function getEnv(): Env {
  if (cachedEnv) {
    return cachedEnv;
  }

  cachedEnv = envSchema.parse(process.env);
  return cachedEnv;
}
