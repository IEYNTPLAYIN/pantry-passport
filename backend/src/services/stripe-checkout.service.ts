import type Stripe from "stripe";

import { ApiError } from "../lib/errors.js";

type CheckoutDependencies = {
  stripe: Stripe;
  priceId: string;
  frontendUrl: string;
  successPath: string;
  cancelPath: string;
};

export class StripeCheckoutService {
  constructor(private readonly dependencies: CheckoutDependencies) {}

  async createCheckoutSession(user: { id: string; email: string }) {
    try {
      const session = await this.dependencies.stripe.checkout.sessions.create({
        mode: "subscription",
        customer_email: user.email,
        success_url: new URL(this.dependencies.successPath, this.dependencies.frontendUrl).toString(),
        cancel_url: new URL(this.dependencies.cancelPath, this.dependencies.frontendUrl).toString(),
        line_items: [
          {
            price: this.dependencies.priceId,
            quantity: 1,
          },
        ],
        metadata: {
          demoUserId: user.id,
          demoUserEmail: user.email,
        },
      });

      if (!session.url) {
        throw new ApiError(502, "STRIPE_SESSION_MISSING_URL", "Stripe did not return a checkout URL.");
      }

      return {
        checkoutUrl: session.url,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError(502, "STRIPE_CHECKOUT_ERROR", "Unable to start the Stripe checkout session.");
    }
  }
}
