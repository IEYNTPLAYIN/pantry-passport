import { SubscriptionStatus } from "@prisma/client";
import { describe, expect, it } from "vitest";

import { SubscriptionService } from "../src/services/subscription.service.js";

describe("SubscriptionService", () => {
  it("marks active subscriptions as nutrition-enabled", async () => {
    const service = new SubscriptionService({
      subscription: {
        findUnique: () => Promise.resolve({
          status: SubscriptionStatus.ACTIVE,
        }),
      },
    } as never);

    await expect(service.getSummary("user-1")).resolves.toEqual({
      status: SubscriptionStatus.ACTIVE,
      isActive: true,
      canAccessNutrition: true,
    });
  });
});
