import { SubscriptionStatus } from "@prisma/client";

const activeStatuses = new Set<SubscriptionStatus>([
  SubscriptionStatus.ACTIVE,
  SubscriptionStatus.TRIALING,
]);

export function isSubscriptionActive(status: SubscriptionStatus | null | undefined) {
  return status ? activeStatuses.has(status) : false;
}
