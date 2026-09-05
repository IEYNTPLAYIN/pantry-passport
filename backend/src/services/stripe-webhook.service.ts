import { Prisma, SubscriptionStatus, type PrismaClient } from "@prisma/client";
import type Stripe from "stripe";

function toSubscriptionStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
  switch (status) {
    case "active":
      return SubscriptionStatus.ACTIVE;
    case "trialing":
      return SubscriptionStatus.TRIALING;
    case "past_due":
      return SubscriptionStatus.PAST_DUE;
    case "unpaid":
      return SubscriptionStatus.UNPAID;
    case "incomplete":
      return SubscriptionStatus.INCOMPLETE;
    case "incomplete_expired":
      return SubscriptionStatus.INCOMPLETE_EXPIRED;
    case "canceled":
      return SubscriptionStatus.CANCELED;
    default:
      return SubscriptionStatus.CANCELED;
  }
}

function getCurrentPeriodEnd(subscription: Stripe.Subscription) {
  const timestamp = subscription.items.data[0]?.current_period_end;
  return typeof timestamp === "number" ? new Date(timestamp * 1000) : null;
}

type WebhookDependencies = {
  prisma: PrismaClient;
  stripe: Stripe;
  webhookSecret: string;
};

export class StripeWebhookService {
  constructor(private readonly dependencies: WebhookDependencies) {}

  verifyAndConstructEvent(payload: Buffer, signature: string | undefined) {
    return this.dependencies.stripe.webhooks.constructEvent(payload, signature ?? "", this.dependencies.webhookSecret);
  }

  async handleEvent(event: Stripe.Event) {
    const created = await this.createWebhookMarker(event.id, event.type);
    if (!created) {
      return { processed: false };
    }

    switch (event.type) {
      case "checkout.session.completed":
        await this.handleCheckoutCompleted(event.data.object);
        break;
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await this.handleSubscriptionChange(event.data.object);
        break;
      default:
        break;
    }

    return { processed: true };
  }

  private async createWebhookMarker(stripeEventId: string, type: string) {
    try {
      await this.dependencies.prisma.webhookEvent.create({
        data: {
          stripeEventId,
          type,
        },
      });
      return true;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        return false;
      }

      throw error;
    }
  }

  private async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const demoUserId = session.metadata?.demoUserId;
    if (!demoUserId) {
      return;
    }

    await this.dependencies.prisma.$transaction(async (transaction) => {
      const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;
      const subscriptionId =
        typeof session.subscription === "string" ? session.subscription : session.subscription?.id ?? null;

      await transaction.user.update({
        where: { id: demoUserId },
        data: {
          ...(customerId ? { stripeCustomerId: customerId } : {}),
        },
      });

      await transaction.subscription.upsert({
        where: { userId: demoUserId },
        update: {
          ...(customerId ? { stripeCustomerId: customerId } : {}),
          stripeCheckoutSessionId: session.id,
          ...(subscriptionId ? { stripeSubscriptionId: subscriptionId } : {}),
        },
        create: {
          userId: demoUserId,
          ...(customerId ? { stripeCustomerId: customerId } : {}),
          stripeCheckoutSessionId: session.id,
          ...(subscriptionId ? { stripeSubscriptionId: subscriptionId } : {}),
          status: SubscriptionStatus.INCOMPLETE,
        },
      });
    });
  }

  private async handleSubscriptionChange(subscription: Stripe.Subscription) {
    const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
    const whereClauses = [
      { stripeCustomerId: customerId },
      ...(subscription.metadata.demoUserId ? [{ id: subscription.metadata.demoUserId }] : []),
      ...(subscription.metadata.demoUserEmail ? [{ email: subscription.metadata.demoUserEmail }] : []),
    ];

    const user = await this.dependencies.prisma.user.findFirst({
      where: { OR: whereClauses },
    });

    if (!user) {
      return;
    }

    await this.dependencies.prisma.$transaction(async (transaction) => {
      await transaction.user.update({
        where: { id: user.id },
        data: {
          stripeCustomerId: customerId,
        },
      });

      await transaction.subscription.upsert({
        where: { userId: user.id },
        update: {
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscription.id,
          stripePriceId: subscription.items.data[0]?.price.id ?? null,
          status: toSubscriptionStatus(subscription.status),
          currentPeriodEnd: getCurrentPeriodEnd(subscription),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        },
        create: {
          userId: user.id,
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscription.id,
          stripePriceId: subscription.items.data[0]?.price.id ?? null,
          status: toSubscriptionStatus(subscription.status),
          currentPeriodEnd: getCurrentPeriodEnd(subscription),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        },
      });
    });
  }
}
