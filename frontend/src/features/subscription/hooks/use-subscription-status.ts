"use client";

import { useQuery } from "@tanstack/react-query";

import { apiRequest } from "@/shared/api";
import { queryKeys } from "@/shared/constants";
import type { SubscriptionSummary } from "@/features/subscription";

export function useSubscriptionStatus() {
  return useQuery({
    queryKey: queryKeys.subscriptionStatus,
    queryFn: () => apiRequest<SubscriptionSummary>("/api/subscription/status"),
  });
}
