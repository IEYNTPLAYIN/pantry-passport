"use client";

import { startTransition, useState } from "react";

import { ProductCard, useProductSearch } from "@/features/products";
import { RecentSearches, useRecentSearches } from "@/features/searches";
import {
  SubscribeButton,
  useSubscriptionStatus,
} from "@/features/subscription";
import type { CheckoutResponse } from "@/features/subscription";
import { ApiClientError, apiRequest } from "@/shared/api";
import { supportedLanguages } from "@/shared/constants";
import { getTranslations, useStoredLanguage } from "@/shared/i18n";
import type { Product, SupportedLanguage } from "@/types";

export function HomeShell() {
  const [language, setLanguage] = useStoredLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [checkoutPending, setCheckoutPending] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const t = getTranslations(language);
  const searchMutation = useProductSearch();
  const recentSearches = useRecentSearches();
  const subscriptionStatus = useSubscriptionStatus();

  async function runSearch(query: string) {
    setHasSearched(true);
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      searchMutation.reset();
      setResults([]);
      return;
    }

    try {
      const response = await searchMutation.mutateAsync({
        query: trimmedQuery,
        language,
      });
      setResults(response.products);
    } catch {
      setResults([]);
    }
  }

  async function startCheckout() {
    try {
      setCheckoutPending(true);
      setCheckoutError(null);

      const response = await apiRequest<CheckoutResponse>(
        "/api/subscription/checkout",
        {
          method: "POST",
          body: JSON.stringify({}),
        },
      );

      window.location.assign(response.checkoutUrl);
    } catch (error) {
      setCheckoutError(
        error instanceof ApiClientError ? error.message : t.errorTitle,
      );
    } finally {
      setCheckoutPending(false);
    }
  }

  function onLanguageChange(nextLanguage: SupportedLanguage) {
    startTransition(() => {
      setLanguage(nextLanguage);
    });
  }

  const hasResults = results.length > 0;
  const showEmptyState =
    hasSearched &&
    !searchMutation.isPending &&
    !searchMutation.isError &&
    !hasResults;

  return (
    <main className="mx-auto max-w-7xl px-5 py-6 md:px-8 lg:px-10">
      <section className="overflow-hidden rounded-[2rem] border border-white/60 bg-white/70 shadow-soft backdrop-blur">
        <div className="grid gap-10 p-6 lg:grid-cols-[1.4fr_0.7fr] lg:p-10">
          <div>
            <header className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-meadow">
                  {t.heroEyebrow}
                </p>
                <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight md:text-5xl">
                  {t.heroTitle}
                </h1>
              </div>
              <div className="space-y-3">
                <div className="rounded-full bg-canvas px-4 py-2 text-sm font-semibold">
                  {t.appName}
                </div>
                <div
                  className={`rounded-2xl px-4 py-3 text-sm font-medium ${
                    subscriptionStatus.data?.isActive
                      ? "bg-meadow text-white"
                      : "bg-oat/40 text-ink"
                  }`}
                >
                  {subscriptionStatus.data?.isActive
                    ? t.statusActive
                    : t.statusInactive}
                </div>
              </div>
            </header>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-ink/75">
              {t.heroBody}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {supportedLanguages.map((entry) => (
                <button
                  key={entry}
                  type="button"
                  onClick={() => onLanguageChange(entry)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em] transition ${
                    language === entry
                      ? "bg-ink text-white"
                      : "bg-canvas text-ink hover:bg-oat/50"
                  }`}
                >
                  {entry}
                </button>
              ))}
            </div>

            <form
              className="mt-8 flex flex-col gap-4 md:flex-row"
              onSubmit={(event) => {
                event.preventDefault();
                void runSearch(searchTerm);
              }}
            >
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder={t.searchPlaceholder}
                className="min-h-14 flex-1 rounded-full border border-transparent bg-canvas px-5 text-base text-ink outline-none ring-0 transition focus:border-oat"
              />
              <button
                type="submit"
                disabled={searchMutation.isPending}
                className="min-h-14 rounded-full bg-meadow px-6 font-semibold text-white transition hover:bg-meadow/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {searchMutation.isPending ? t.loading : t.searchButton}
              </button>
            </form>
          </div>

          <div className="rounded-card bg-ink p-6 text-white">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/70">
              {t.subscriptionCtaTitle}
            </p>
            <p className="mt-4 text-lg leading-8 text-white/85">
              {t.subscriptionCtaBody}
            </p>
            <div className="mt-8">
              <SubscribeButton
                disabled={checkoutPending}
                label={t.subscribe}
                onClick={() => void startCheckout()}
              />
            </div>
            <p className="mt-4 text-sm leading-6 text-white/70">
              {t.activationPending}
            </p>
            {checkoutError ? (
              <p className="mt-4 text-sm text-[#ffd3c0]">{checkoutError}</p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-8 xl:grid-cols-[1.5fr_0.7fr]">
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
                  onSubscribe={() => void startCheckout()}
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

        <RecentSearches
          heading={t.recentSearches}
          emptyLabel={t.recentSearchesEmpty}
          searches={recentSearches.data?.searches ?? []}
          onSelectSearch={(query) => {
            setSearchTerm(query);
            void runSearch(query);
          }}
        />
      </section>
    </main>
  );
}
