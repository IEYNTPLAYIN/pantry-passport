import { Router } from "express";

import { ApiError } from "../lib/errors.js";
import { asyncHandler } from "../lib/http.js";
import type { StripeWebhookService } from "../services/stripe-webhook.service.js";

export function createWebhookRoutes(stripeWebhookService: StripeWebhookService) {
  const router = Router();

  router.post(
    "/stripe",
    asyncHandler(async (request, response) => {
      if (!Buffer.isBuffer(request.body)) {
        throw new ApiError(400, "INVALID_WEBHOOK_BODY", "The Stripe webhook body must be raw.");
      }

      let event;

      try {
        event = stripeWebhookService.verifyAndConstructEvent(request.body, request.header("stripe-signature"));
      } catch {
        throw new ApiError(400, "INVALID_STRIPE_SIGNATURE", "The Stripe webhook signature could not be verified.");
      }

      const result = await stripeWebhookService.handleEvent(event);
      response.json(result);
    }),
  );

  return router;
}
