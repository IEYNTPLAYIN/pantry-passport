import { SubscriptionStatus } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";
import type Stripe from "stripe";

import { StripeWebhookService } from "../src/services/stripe-webhook.service.js";

describe("StripeWebhookService", () => {
  it("updates subscription state from Stripe subscription events", async () => {
    const upsert = vi
      .fn<(args: { update: { status: SubscriptionStatus } }) => Promise<void>>()
      .mockResolvedValue(undefined);
    const updateUser = vi.fn().mockResolvedValue(undefined);
    const createWebhook = vi.fn().mockResolvedValue(undefined);
    const findUser = vi.fn().mockResolvedValue({
      id: "user-1",
      email: "demo@example.com",
    });

    const prisma = {
      webhookEvent: {
        create: createWebhook,
      },
      user: {
        findFirst: findUser,
        update: updateUser,
      },
      subscription: {
        upsert,
      },
      $transaction: async (callback: (tx: typeof prisma) => Promise<void>) => callback(prisma),
    } as never;

    const stripe = {
      webhooks: {
        constructEvent: vi.fn(),
      },
    } as unknown as Stripe;

    const service = new StripeWebhookService({
      prisma,
      stripe,
      webhookSecret: "whsec_test",
    });

    const event = {
      id: "evt_1",
      type: "customer.subscription.updated",
      data: {
        object: {
          id: "sub_1",
          status: "active",
          customer: "cus_123",
          cancel_at_period_end: false,
          items: {
            data: [
              {
                current_period_end: 1_726_000_000,
                price: { id: "price_123" },
              },
            ],
          },
          metadata: {
            demoUserEmail: "demo@example.com",
          },
        },
      },
    } as unknown as Stripe.Event;

    await service.handleEvent(event);

    const firstCall = upsert.mock.calls[0]?.[0];
    expect(firstCall?.update.status).toBe(SubscriptionStatus.ACTIVE);
  });
});
