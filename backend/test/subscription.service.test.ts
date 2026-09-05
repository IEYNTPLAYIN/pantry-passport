import { SubscriptionStatus } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";

import { SubscriptionService } from "../src/services/subscription.service.js";

describe("SubscriptionService", () => {
  it("marks active subscriptions as nutrition-enabled", async () => {
    const prisma = {
      subscription: {
        findUnique: () => Promise.resolve({
          status: SubscriptionStatus.ACTIVE,
        }),
      },
    };
    const service = new SubscriptionService({
      prisma: prisma as never,
      stripe: {} as never,
      priceId: "price_monthly",
    });

    await expect(service.getSummary("user-1")).resolves.toEqual({
      status: SubscriptionStatus.ACTIVE,
      isActive: true,
      canAccessNutrition: true,
      cancelAtPeriodEnd: false,
      currentPeriodEnd: null,
    });
  });

  it("recovers an active subscription when its webhook was missed", async () => {
    const upsert = vi
      .fn<(args: { update: { status: SubscriptionStatus } }) => Promise<void>>()
      .mockResolvedValue(undefined);
    const updateUser = vi.fn().mockResolvedValue(undefined);
    const transaction = {
      user: { update: updateUser },
      subscription: {
        findUnique: vi.fn().mockResolvedValue({ status: SubscriptionStatus.ACTIVE }),
        upsert,
      },
    };
    const prisma = {
      ...transaction,
      $transaction: async (callback: (client: typeof transaction) => Promise<void>) => callback(transaction),
    };
    const stripe = {
      customers: {
        list: vi.fn().mockResolvedValue({ data: [{ id: "cus_123", deleted: false }] }),
      },
      subscriptions: {
        list: vi.fn().mockResolvedValue({
          data: [{
            id: "sub_123",
            customer: "cus_123",
            status: "active",
            created: 1_800_000_000,
            cancel_at_period_end: false,
            items: {
              data: [{ price: { id: "price_monthly" }, current_period_end: 1_900_000_000 }],
            },
          }],
        }),
      },
    };
    const service = new SubscriptionService({
      prisma: prisma as never,
      stripe: stripe as never,
      priceId: "price_monthly",
    });

    await expect(service.syncFromStripe({ id: "user-1", email: "demo@example.com" })).resolves.toEqual({
      status: SubscriptionStatus.ACTIVE,
      isActive: true,
      canAccessNutrition: true,
      cancelAtPeriodEnd: false,
      currentPeriodEnd: null,
    });
    expect(upsert.mock.calls[0]?.[0].update.status).toBe(SubscriptionStatus.ACTIVE);
  });

  it("schedules cancellation in Stripe and keeps access through the billing period", async () => {
    const periodEnd = new Date("2030-03-17T00:00:00.000Z");
    const findUnique = vi.fn()
      .mockResolvedValueOnce({
        stripeSubscriptionId: "sub_123",
        status: SubscriptionStatus.ACTIVE,
      })
      .mockResolvedValueOnce({
        status: SubscriptionStatus.ACTIVE,
        cancelAtPeriodEnd: true,
        currentPeriodEnd: periodEnd,
      });
    const upsert = vi.fn().mockResolvedValue(undefined);
    const transaction = {
      user: { update: vi.fn().mockResolvedValue(undefined) },
      subscription: { upsert },
    };
    const prisma = {
      subscription: { findUnique },
      $transaction: async (callback: (client: typeof transaction) => Promise<void>) => callback(transaction),
    };
    const updateStripeSubscription = vi.fn().mockResolvedValue({
      id: "sub_123",
      customer: "cus_123",
      status: "active",
      cancel_at_period_end: true,
      items: {
        data: [{ price: { id: "price_monthly" }, current_period_end: 1_899_936_000 }],
      },
    });
    const service = new SubscriptionService({
      prisma: prisma as never,
      stripe: { subscriptions: { update: updateStripeSubscription } } as never,
      priceId: "price_monthly",
    });

    await expect(service.cancelAtPeriodEnd({ id: "user-1", email: "demo@example.com" })).resolves.toEqual({
      status: SubscriptionStatus.ACTIVE,
      isActive: true,
      canAccessNutrition: true,
      cancelAtPeriodEnd: true,
      currentPeriodEnd: periodEnd.toISOString(),
    });
    expect(updateStripeSubscription).toHaveBeenCalledWith("sub_123", { cancel_at_period_end: true });
  });
});
