import { SubscriptionStatus, type PrismaClient } from "@prisma/client";
import type Stripe from "stripe";

import { ApiError } from "../lib/errors.js";
import { isSubscriptionActive } from "../lib/subscription.js";
import type { SubscriptionSummary } from "../types/subscription.js";

export class SubscriptionService {
  constructor(
    private readonly dependencies: {
      prisma: PrismaClient;
      stripe: Stripe;
      priceId: string;
    },
  ) {}

  async getSummary(userId: string): Promise<SubscriptionSummary> {
    const subscription = await this.dependencies.prisma.subscription.findUnique({
      where: { userId },
    });

    const status = subscription?.status ?? SubscriptionStatus.CANCELED;
    const isActive = isSubscriptionActive(status);

    return {
      status,
      isActive,
      canAccessNutrition: isActive,
      cancelAtPeriodEnd: subscription?.cancelAtPeriodEnd ?? false,
      currentPeriodEnd: subscription?.currentPeriodEnd?.toISOString() ?? null,
    };
  }

  async syncFromStripe(user: { id: string; email: string }, checkoutSessionId?: string) {
    const subscription = checkoutSessionId
      ? await this.getSubscriptionFromCheckout(user.id, checkoutSessionId)
      : await this.findLatestSubscription(user.email);

    if (!subscription) {
      return this.getSummary(user.id);
    }

    await this.persistStripeSubscription(user.id, subscription, checkoutSessionId);

    return this.getSummary(user.id);
  }

  async cancelAtPeriodEnd(user: { id: string; email: string }) {
    let localSubscription = await this.dependencies.prisma.subscription.findUnique({
      where: { userId: user.id },
      select: { stripeSubscriptionId: true, status: true },
    });

    if (!localSubscription?.stripeSubscriptionId) {
      await this.syncFromStripe(user);
      localSubscription = await this.dependencies.prisma.subscription.findUnique({
        where: { userId: user.id },
        select: { stripeSubscriptionId: true, status: true },
      });
    }

    if (!localSubscription?.stripeSubscriptionId || !isSubscriptionActive(localSubscription.status)) {
      throw new ApiError(409, "SUBSCRIPTION_NOT_ACTIVE", "There is no active subscription to cancel.");
    }

    try {
      const subscription = await this.dependencies.stripe.subscriptions.update(
        localSubscription.stripeSubscriptionId,
        { cancel_at_period_end: true },
      );
      await this.persistStripeSubscription(user.id, subscription);
      return this.getSummary(user.id);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError(
        502,
        "STRIPE_CANCELLATION_ERROR",
        "Stripe could not schedule the subscription cancellation. Please try again.",
      );
    }
  }

  private async getSubscriptionFromCheckout(userId: string, checkoutSessionId: string) {
    const session = await this.dependencies.stripe.checkout.sessions.retrieve(checkoutSessionId);
    if (session.metadata?.demoUserId !== userId || !session.subscription) {
      return null;
    }

    const subscriptionId = typeof session.subscription === "string"
      ? session.subscription
      : session.subscription.id;
    return this.dependencies.stripe.subscriptions.retrieve(subscriptionId);
  }

  private async findLatestSubscription(email: string) {
    const customers = await this.dependencies.stripe.customers.list({ email, limit: 100 });
    const subscriptions = (
      await Promise.all(
        customers.data
          .filter((customer) => !customer.deleted)
          .map((customer) => this.dependencies.stripe.subscriptions.list({
            customer: customer.id,
            status: "all",
            limit: 100,
          })),
      )
    ).flatMap((page) => page.data);

    return subscriptions
      .filter((subscription) => subscription.items.data.some((item) => item.price.id === this.dependencies.priceId))
      .sort((left, right) => right.created - left.created)[0] ?? null;
  }

  private async persistStripeSubscription(
    userId: string,
    subscription: Stripe.Subscription,
    checkoutSessionId?: string,
  ) {
    const customerId = typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;
    const stripePriceId = subscription.items.data[0]?.price.id ?? null;
    const currentPeriodEnd = subscription.items.data[0]?.current_period_end;
    const subscriptionData = {
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscription.id,
      stripePriceId,
      status: toSubscriptionStatus(subscription.status),
      currentPeriodEnd: typeof currentPeriodEnd === "number" ? new Date(currentPeriodEnd * 1000) : null,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      ...(checkoutSessionId ? { stripeCheckoutSessionId: checkoutSessionId } : {}),
    };

    await this.dependencies.prisma.$transaction(async (transaction) => {
      await transaction.user.update({
        where: { id: userId },
        data: { stripeCustomerId: customerId },
      });
      await transaction.subscription.upsert({
        where: { userId },
        update: subscriptionData,
        create: { userId, ...subscriptionData },
      });
    });
  }
}

function toSubscriptionStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
  const statuses: Partial<Record<Stripe.Subscription.Status, SubscriptionStatus>> = {
    active: SubscriptionStatus.ACTIVE,
    trialing: SubscriptionStatus.TRIALING,
    past_due: SubscriptionStatus.PAST_DUE,
    unpaid: SubscriptionStatus.UNPAID,
    incomplete: SubscriptionStatus.INCOMPLETE,
    incomplete_expired: SubscriptionStatus.INCOMPLETE_EXPIRED,
    canceled: SubscriptionStatus.CANCELED,
  };

  return statuses[status] ?? SubscriptionStatus.CANCELED;
}
