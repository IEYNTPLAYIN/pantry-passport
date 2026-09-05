import cors from "cors";
import express from "express";
import type { PrismaClient } from "@prisma/client";
import type Stripe from "stripe";

import { createDemoUserMiddleware } from "./middleware/demo-user.js";
import { requestIdMiddleware } from "./middleware/request-id.js";
import { errorMiddleware } from "./lib/http.js";
import { createHealthRoutes } from "./routes/health.routes.js";
import { createProductRoutes } from "./routes/products.routes.js";
import { createSearchesRoutes } from "./routes/searches.routes.js";
import { createSubscriptionRoutes } from "./routes/subscription.routes.js";
import { createWebhookRoutes } from "./routes/webhooks.routes.js";
import { OpenFoodFactsService } from "./services/open-food-facts.service.js";
import { ProductSearchService } from "./services/product-search.service.js";
import { SearchHistoryService } from "./services/search-history.service.js";
import { StripeCheckoutService } from "./services/stripe-checkout.service.js";
import { StripeWebhookService } from "./services/stripe-webhook.service.js";
import { SubscriptionService } from "./services/subscription.service.js";

type AppConfig = {
  prisma: PrismaClient;
  stripe: Stripe;
  frontendUrl: string;
  openFoodFactsBaseUrl: string;
  stripePriceId: string;
  stripeWebhookSecret: string;
  demoUserEmail: string;
  stripeSuccessPath: string;
  stripeCancelPath: string;
};

export function createApp(config: AppConfig) {
  const app = express();

  const searchHistoryService = new SearchHistoryService(config.prisma);
  const subscriptionService = new SubscriptionService(config.prisma);
  const foodFactsService = new OpenFoodFactsService(config.openFoodFactsBaseUrl);
  const productSearchService = new ProductSearchService({
    foodFactsService,
    searchHistoryService,
    subscriptionService,
  });
  const stripeCheckoutService = new StripeCheckoutService({
    stripe: config.stripe,
    frontendUrl: config.frontendUrl,
    priceId: config.stripePriceId,
    successPath: config.stripeSuccessPath,
    cancelPath: config.stripeCancelPath,
  });
  const stripeWebhookService = new StripeWebhookService({
    prisma: config.prisma,
    stripe: config.stripe,
    webhookSecret: config.stripeWebhookSecret,
  });

  app.use(requestIdMiddleware);

  app.use(
    cors({
      origin: config.frontendUrl,
    }),
  );

  app.use("/api/webhooks", express.raw({ type: "application/json" }), createWebhookRoutes(stripeWebhookService));
  app.use(express.json());

  app.use("/api/health", createHealthRoutes());
  app.use(createDemoUserMiddleware(config.prisma, config.demoUserEmail));
  app.use("/api/products", createProductRoutes(productSearchService));
  app.use("/api/searches", createSearchesRoutes(searchHistoryService));
  app.use("/api/subscription", createSubscriptionRoutes(subscriptionService, stripeCheckoutService));
  app.use(errorMiddleware);

  return app;
}
