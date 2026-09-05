'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { apiRequest } from '@/shared/api'
import { queryKeys } from '@/shared/constants'
import type {
  ProductSearchVariables,
  ProductSearchResponse,
} from '@/features/products'

export function useProductSearch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ query, language }: ProductSearchVariables) =>
      apiRequest<ProductSearchResponse>(
        `/api/products/search?q=${encodeURIComponent(query)}&lang=${language}`
      ),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.recentSearches }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.subscriptionStatus,
        }),
      ])
    },
  })
}
