import type { SupportedLanguage } from '@/types'

export const supportedLanguages = [
  'en',
  'nl',
  'de',
  'fr',
] as const satisfies readonly SupportedLanguage[]
