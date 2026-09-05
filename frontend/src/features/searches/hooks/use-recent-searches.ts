'use client'

import { useQuery } from '@tanstack/react-query'

import type { RecentSearchResponse } from '@/features/searches'
import { apiRequest } from '@/shared/api'
import { queryKeys } from '@/shared/constants'

export function useRecentSearches() {
  return useQuery({
    queryKey: queryKeys.recentSearches,
    queryFn: () =>
      apiRequest<RecentSearchResponse>('/api/searches/recent?limit=6'),
    meta: { persist: true },
  })
}
