import { Router } from "express";
import { z } from "zod";

import { asyncHandler } from "../lib/http.js";
import type { StripeCheckoutService } from "../services/stripe-checkout.service.js";
import type { SubscriptionService } from "../services/subscription.service.js";

export function createSubscriptionRoutes(
  subscriptionService: SubscriptionService,
  stripeCheckoutService: StripeCheckoutService,
) {
  const router = Router();
  const syncRequestSchema = z.object({
    checkoutSessionId: z.string().startsWith("cs_").optional(),
  });

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

  router.post(
    "/sync",
    asyncHandler(async (request, response) => {
      const input = syncRequestSchema.parse(request.body);
      const summary = await subscriptionService.syncFromStripe(
        { id: request.demoUser!.id, email: request.demoUser!.email },
        input.checkoutSessionId,
      );
      response.json(summary);
    }),
  );

  router.post(
    "/cancel",
    asyncHandler(async (request, response) => {
      const summary = await subscriptionService.cancelAtPeriodEnd({
        id: request.demoUser!.id,
        email: request.demoUser!.email,
      });
      response.json(summary);
    }),
  );

  return router;
}
