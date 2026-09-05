"use client";

import { startTransition, useState } from "react";

import { ProductCard, useProductSearch } from "@/features/products";
import { RecentSearches, useRecentSearches } from "@/features/searches";
import {
  SubscribeButton,
  useCancelSubscription,
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
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);

  const t = getTranslations(language);
  const searchMutation = useProductSearch();
  const recentSearches = useRecentSearches();
  const subscriptionStatus = useSubscriptionStatus();
  const cancelSubscription = useCancelSubscription();

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

  async function cancelRenewal() {
    setCheckoutError(null);
    try {
      await cancelSubscription.mutateAsync();
      setShowCancelConfirmation(false);
    } catch (error) {
      setCheckoutError(error instanceof ApiClientError ? error.message : t.errorTitle);
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
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-5 sm:px-6 sm:py-8 lg:px-10 lg:py-12">
      <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 shadow-soft backdrop-blur-md">
        <div className="grid gap-8 p-5 sm:p-7 lg:grid-cols-[minmax(0,1.45fr)_minmax(19rem,0.65fr)] lg:gap-10 lg:p-10">
          <div className="min-w-0">
            <header className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-meadow">
                  {t.heroEyebrow}
                </p>
                <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight md:text-5xl">
                  {t.heroTitle}
                </h1>
              </div>
              <div className="shrink-0 space-y-3 sm:max-w-52">
                <div className="rounded-full border border-oat/50 bg-canvas px-4 py-2 text-center text-sm font-semibold">
                  {t.appName}
                </div>
                <div
                  className={`rounded-2xl px-4 py-3 text-sm font-medium shadow-sm ${
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

            <div className="mt-8 flex flex-wrap gap-2" aria-label="Language selection">
              {supportedLanguages.map((entry) => (
                <button
                  key={entry}
                  type="button"
                  onClick={() => onLanguageChange(entry)}
                  className={`min-h-11 rounded-full px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em] transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meadow ${
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
                aria-label={t.searchPlaceholder}
                placeholder={t.searchPlaceholder}
                className="min-h-14 min-w-0 flex-1 rounded-full border border-oat/60 bg-canvas px-5 text-base text-ink outline-none transition placeholder:text-ink/45 focus:border-meadow focus:ring-4 focus:ring-meadow/10"
              />
              <button
                type="submit"
                disabled={searchMutation.isPending}
                className="min-h-14 rounded-full bg-meadow px-6 font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-meadow/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meadow disabled:cursor-not-allowed disabled:opacity-60 md:min-w-44"
              >
                {searchMutation.isPending ? t.loading : t.searchButton}
              </button>
            </form>
          </div>

          <aside className="relative isolate overflow-hidden rounded-card border border-white/10 bg-ink p-6 text-white shadow-soft sm:p-7">
            <div className="pointer-events-none absolute -right-16 -top-20 -z-10 size-52 rounded-full bg-peach/20 blur-2xl" />
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/70">
              {t.subscriptionCtaTitle}
            </p>
            <p className="mt-4 text-lg leading-8 text-white/85">
              {t.subscriptionCtaBody}
            </p>
            <div className="mt-8">
              {subscriptionStatus.data?.isActive ? (
                subscriptionStatus.data.cancelAtPeriodEnd ? (
                  <p className="rounded-2xl border border-white/15 bg-white/10 p-4 text-sm leading-6 text-white/85">
                    {t.cancellationScheduled.replace(
                      "{date}",
                      subscriptionStatus.data.currentPeriodEnd
                        ? new Intl.DateTimeFormat(language, { dateStyle: "long" }).format(
                            new Date(subscriptionStatus.data.currentPeriodEnd),
                          )
                        : "-",
                    )}
                  </p>
                ) : showCancelConfirmation ? (
                  <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
                    <p className="text-sm leading-6 text-white/85">{t.cancelSubscriptionConfirm}</p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        type="button"
                        disabled={cancelSubscription.isPending}
                        onClick={() => void cancelRenewal()}
                        className="min-h-11 rounded-full bg-peach px-4 py-2 text-sm font-semibold text-white transition hover:bg-peach/90 disabled:opacity-60"
                      >
                        {cancelSubscription.isPending ? t.cancelling : t.confirmCancellation}
                      </button>
                      <button
                        type="button"
                        disabled={cancelSubscription.isPending}
                        onClick={() => setShowCancelConfirmation(false)}
                        className="min-h-11 rounded-full border border-white/30 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-60"
                      >
                        {t.keepSubscription}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowCancelConfirmation(true)}
                    className="min-h-12 rounded-full border border-white/35 px-5 py-3 font-semibold text-white transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    {t.cancelSubscription}
                  </button>
                )
              ) : (
                <SubscribeButton
                  disabled={checkoutPending}
                  label={t.subscribe}
                  onClick={() => void startCheckout()}
                />
              )}
            </div>
            {!subscriptionStatus.data?.isActive ? (
              <p className="mt-4 text-sm leading-6 text-white/70">
                {t.activationPending}
              </p>
            ) : null}
            {checkoutError ? (
              <p className="mt-4 text-sm text-[#ffd3c0]">{checkoutError}</p>
            ) : null}
          </aside>
        </div>
      </section>

      <section className="mt-6 grid items-start gap-6 lg:mt-8 xl:grid-cols-[minmax(0,1.5fr)_minmax(18rem,0.7fr)] xl:gap-8">
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
