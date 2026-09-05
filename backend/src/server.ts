import Stripe from "stripe";

import { createApp } from "./app.js";
import { getEnv } from "./config/env.js";
import { createPrismaClient } from "./lib/prisma.js";

const env = getEnv();
const prisma = createPrismaClient(env.DATABASE_URL);
const stripe = new Stripe(env.STRIPE_SECRET_KEY);
const app = createApp({
  prisma,
  stripe,
  frontendUrl: env.FRONTEND_URL,
  openFoodFactsBaseUrl: env.OPEN_FOOD_FACTS_BASE_URL,
  stripePriceId: env.STRIPE_PRICE_ID,
  stripeWebhookSecret: env.STRIPE_WEBHOOK_SECRET,
  demoUserEmail: env.DEMO_USER_EMAIL,
  stripeSuccessPath: env.STRIPE_SUCCESS_PATH,
  stripeCancelPath: env.STRIPE_CANCEL_PATH,
});

const server = app.listen(env.PORT, () => {
  console.log(`Backend listening on http://localhost:${env.PORT}`);
});

function shutdown() {
  server.close(() => {
    void prisma.$disconnect();
  });
}

process.on("SIGINT", () => void shutdown());
process.on("SIGTERM", () => void shutdown());
