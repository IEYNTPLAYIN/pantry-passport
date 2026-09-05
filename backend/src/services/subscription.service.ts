import { SubscriptionStatus, type PrismaClient } from "@prisma/client";

import { isSubscriptionActive } from "../lib/subscription.js";
import type { SubscriptionSummary } from "../types/subscription.js";

export class SubscriptionService {
  constructor(private readonly prisma: Pick<PrismaClient, "subscription">) {}

  async getSummary(userId: string): Promise<SubscriptionSummary> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    const status = subscription?.status ?? SubscriptionStatus.CANCELED;
    const isActive = isSubscriptionActive(status);

    return {
      status,
      isActive,
      canAccessNutrition: isActive,
    };
  }
}
