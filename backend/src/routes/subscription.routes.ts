import { Router } from "express";

import { asyncHandler } from "../lib/http.js";
import type { StripeCheckoutService } from "../services/stripe-checkout.service.js";
import type { SubscriptionService } from "../services/subscription.service.js";

export function createSubscriptionRoutes(
  subscriptionService: SubscriptionService,
  stripeCheckoutService: StripeCheckoutService,
) {
  const router = Router();

  router.get(
    "/status",
    asyncHandler(async (request, response) => {
      const summary = await subscriptionService.getSummary(request.demoUser!.id);
      response.json(summary);
    }),
  );

  router.post(
    "/checkout",
    asyncHandler(async (request, response) => {
      const session = await stripeCheckoutService.createCheckoutSession({
        id: request.demoUser!.id,
        email: request.demoUser!.email,
      });

      response.status(201).json(session);
    }),
  );

  return router;
}
