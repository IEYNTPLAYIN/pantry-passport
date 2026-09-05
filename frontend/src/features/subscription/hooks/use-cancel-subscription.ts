'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { SubscriptionSummary } from '@/features/subscription'
import { apiRequest } from '@/shared/api'
import { queryKeys } from '@/shared/constants'

export function useCancelSubscription() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () =>
      apiRequest<SubscriptionSummary>('/api/subscription/cancel', {
        method: 'POST',
        body: JSON.stringify({}),
      }),
    onSuccess: (summary) => {
      queryClient.setQueryData(queryKeys.subscriptionStatus, summary)
    },
  })
}
