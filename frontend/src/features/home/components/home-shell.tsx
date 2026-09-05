'use client'

import { useRouter } from 'next/navigation'
import { startTransition, useState } from 'react'

import { LanguageSelector } from '@/features/home'
import { ProductCard, useProductSearch } from '@/features/products'
import { RecentSearches, useRecentSearches } from '@/features/searches'
import {
  PremiumAccessLink,
  useSubscriptionStatus,
} from '@/features/subscription'
import { ApiClientError } from '@/shared/api'
import { getTranslations, useStoredLanguage } from '@/shared/i18n'
import type { Product, SupportedLanguage } from '@/types'

export function HomeShell() {
  const [language, setLanguage] = useStoredLanguage()
  const [searchTerm, setSearchTerm] = useState('')
  const [results, setResults] = useState<Product[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [showRecentSearches, setShowRecentSearches] = useState(false)

  const router = useRouter()
  const t = getTranslations(language)
  const searchMutation = useProductSearch()
  const recentSearches = useRecentSearches()
  const subscriptionStatus = useSubscriptionStatus()

  async function runSearch(query: string) {
    setHasSearched(true)
    const trimmedQuery = query.trim()

    if (!trimmedQuery) {
      searchMutation.reset()
      setResults([])
      return
    }

    try {
      const response = await searchMutation.mutateAsync({
        query: trimmedQuery,
        language,
      })
      setResults(response.products)
    } catch {
      setResults([])
    }
  }

  function onLanguageChange(nextLanguage: SupportedLanguage) {
    startTransition(() => {
      setLanguage(nextLanguage)
    })
  }

  const hasResults = results.length > 0
  const showEmptyState =
    hasSearched &&
    !searchMutation.isPending &&
    !searchMutation.isError &&
    !hasResults

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-5 sm:px-6 sm:py-8 lg:px-10 lg:py-12">
      <section className="relative z-30 overflow-visible rounded-[2rem] border border-white/70 bg-white/80 shadow-soft backdrop-blur-md">
        <div className="p-5 sm:p-7 lg:p-10">
          <div className="min-w-0">
            <header>
              <div className="ml-auto flex w-full items-center justify-end gap-3 sm:w-auto">
                <div className="min-w-0 flex-1 sm:flex-none">
                  <LanguageSelector
                    value={language}
                    onChange={onLanguageChange}
                  />
                </div>
                <PremiumAccessLink
                  isActive={subscriptionStatus.data?.isActive === true}
                  isLoading={subscriptionStatus.isPending}
                  activateLabel={t.activatePremium}
                  crownLabel={t.premiumLinkLabel}
                />
              </div>
              <div className="mt-7">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-meadow">
                  {t.heroEyebrow}
                </p>
                <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight md:text-5xl">
                  {t.heroTitle}
                </h1>
              </div>
            </header>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-ink/75">
              {t.heroBody}
            </p>

            <form
              className="relative z-50 mt-8 w-full max-w-full"
              onSubmit={(event) => {
                event.preventDefault()
                setShowRecentSearches(false)
                void runSearch(searchTerm)
              }}
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) {
                  setShowRecentSearches(false)
                }
              }}
            >
              <div className="rounded-full border border-oat/65 bg-canvas shadow-sm transition hover:border-meadow/45 hover:shadow-md focus-within:border-meadow focus-within:bg-white focus-within:shadow-[0_12px_35px_rgba(25,54,45,0.1)] focus-within:ring-4 focus-within:ring-meadow/10">
                <div className="flex min-h-16 items-center px-5">
                  {searchMutation.isPending ? (
                    <span
                      className="mr-4 size-5 shrink-0 animate-spin rounded-full border-2 border-meadow/25 border-t-meadow"
                      aria-hidden="true"
                    />
                  ) : (
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="mr-4 size-5 shrink-0 text-meadow"
                    >
                      <circle cx="11" cy="11" r="7" />
                      <path d="m16.2 16.2 4 4" strokeLinecap="round" />
                    </svg>
                  )}
                  <input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    aria-label={t.searchPlaceholder}
                    placeholder={t.searchPlaceholder}
                    autoComplete="off"
                    onFocus={() => setShowRecentSearches(true)}
                    onPointerDown={() => setShowRecentSearches(true)}
                    onKeyDown={(event) => {
                      if (event.key === 'Escape') {
                        setShowRecentSearches(false)
                        event.currentTarget.blur()
                      }
                    }}
                    className="min-h-16 min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-ink/40"
                  />
                  <span className="ml-3 hidden rounded-lg border border-oat/70 bg-white px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-wider text-ink/40 sm:inline">
                    Enter
                  </span>
                </div>
              </div>
              {showRecentSearches ? (
                <RecentSearches
                  heading={t.recentSearches}
                  emptyLabel={t.recentSearchesEmpty}
                  searches={recentSearches.data?.searches ?? []}
                  onSelectSearch={(query) => {
                    setSearchTerm(query)
                    setShowRecentSearches(false)
                    void runSearch(query)
                  }}
                />
              ) : null}
            </form>
          </div>
        </div>
      </section>

      <section className="relative z-0 mt-6 lg:mt-8">
        <div className="space-y-6">
          {searchMutation.isError ? (
            <div className="rounded-card border border-[#efc1a8] bg-[#fff7f2] p-6 shadow-soft">
              <h2 className="text-xl font-semibold">{t.errorTitle}</h2>
              <p className="mt-3 text-sm leading-6 text-ink/75">
                {searchMutation.error instanceof ApiClientError
                  ? searchMutation.error.message
                  : t.errorTitle}
              </p>
            </div>
          ) : null}

          {showEmptyState ? (
            <div className="rounded-card border border-white/60 bg-white/85 p-6 shadow-soft">
              <h2 className="text-xl font-semibold">{t.emptyTitle}</h2>
              <p className="mt-3 text-sm leading-6 text-ink/70">
                {t.emptyBody}
              </p>
            </div>
          ) : null}

          {hasResults ? (
            <div className="grid gap-6 md:grid-cols-2">
              {results.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSubscribe={() => router.push('/subscription')}
                  labels={{
                    noImage: t.noImage,
                    nutritionTitle: t.nutritionTitle,
                    lockedTitle: t.lockedTitle,
                    lockedBody: t.lockedBody,
                    subscribe: t.subscribe,
                    nutritionLabels: t.nutritionLabels,
                  }}
                />
              ))}
            </div>
          ) : null}
        </div>
      </section>
    </main>
  )
}
