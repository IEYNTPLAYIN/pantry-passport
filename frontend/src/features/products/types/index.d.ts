import type { Product, ProductSearchResponse, SupportedLanguage } from '@/types'

export type ProductSearchVariables = {
  query: string
  language: SupportedLanguage
}

export type ProductCardLabels = {
  noImage: string
  nutritionTitle: string
  lockedTitle: string
  lockedBody: string
  subscribe: string
  nutritionLabels: Record<string, string>
}

export type ProductCardProps = {
  labels: ProductCardLabels
  onSubscribe: () => void
  product: Product
}

export type { Product, ProductSearchResponse }
