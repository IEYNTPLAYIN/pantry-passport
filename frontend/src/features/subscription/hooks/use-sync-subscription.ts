'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { SubscriptionSummary } from '@/features/subscription'
import { apiRequest } from '@/shared/api'
import { queryKeys } from '@/shared/constants'

export function useSyncSubscription() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (checkoutSessionId?: string) =>
      apiRequest<SubscriptionSummary>('/api/subscription/sync', {
        method: 'POST',
        body: JSON.stringify({ checkoutSessionId }),
      }),
    onSuccess: (summary) => {
      queryClient.setQueryData(queryKeys.subscriptionStatus, summary)
    },
  })
}
