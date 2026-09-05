"use client";

import Link from "next/link";
import { useState } from "react";

import { SubscribeButton, useCancelSubscription, useSubscriptionStatus } from "@/features/subscription";
import type { CheckoutResponse } from "@/features/subscription";
import { ApiClientError, apiRequest } from "@/shared/api";
import { getTranslations, useStoredLanguage } from "@/shared/i18n";

export function SubscriptionManager() {
  const [language] = useStoredLanguage();
  const [checkoutPending, setCheckoutPending] = useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const t = getTranslations(language);
  const subscriptionStatus = useSubscriptionStatus();
  const cancelSubscription = useCancelSubscription();
  const subscription = subscriptionStatus.data;

  async function startCheckout() {
    setCheckoutPending(true);
    setActionError(null);
    try {
      const response = await apiRequest<CheckoutResponse>("/api/subscription/checkout", {
        method: "POST",
        body: JSON.stringify({}),
      });
      window.location.assign(response.checkoutUrl);
    } catch (error) {
      setActionError(error instanceof ApiClientError ? error.message : t.errorTitle);
      setCheckoutPending(false);
    }
  }

  async function cancelRenewal() {
    setActionError(null);
    try {
      await cancelSubscription.mutateAsync();
      setShowCancelConfirmation(false);
    } catch (error) {
      setActionError(error instanceof ApiClientError ? error.message : t.errorTitle);
    }
  }

  const endDate = subscription?.currentPeriodEnd
    ? new Intl.DateTimeFormat(language, { dateStyle: "long" }).format(new Date(subscription.currentPeriodEnd))
    : "-";

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-6 sm:px-6 sm:py-10 lg:px-10 lg:py-14">
      <Link href="/" className="inline-flex min-h-11 items-center gap-2 rounded-full px-2 text-sm font-semibold text-ink/65 transition hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meadow">
        <span aria-hidden="true">&larr;</span>
        {t.backHome}
      </Link>

      <section className="relative mt-4 overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 shadow-soft backdrop-blur-md">
        <div className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-peach/20 blur-3xl" />
        <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
          <div className="relative p-7 sm:p-10 lg:p-14">
            <div className="grid size-20 place-items-center rounded-[1.6rem] bg-peach text-ink shadow-[0_16px_40px_rgba(241,145,92,0.3)]">
              <svg aria-hidden="true" viewBox="0 0 32 32" fill="none" className="size-10">
                <path d="m5 11 6 5 5-9 5 9 6-5-2.2 13H7.2L5 11Z" fill="currentColor" />
                <path d="M8 27h16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
            <p className="mt-8 text-sm font-semibold uppercase tracking-[0.22em] text-meadow">{t.subscriptionCtaTitle}</p>
            <h1 className="mt-4 max-w-xl text-4xl font-semibold leading-tight text-ink sm:text-5xl">
              {subscription?.isActive ? t.statusActive : t.activatePremium}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-ink/70">{t.subscriptionCtaBody}</p>

            <div className="mt-8">
              {subscriptionStatus.isPending ? (
                <div className="h-12 w-48 animate-pulse rounded-full bg-oat/40" />
              ) : subscription?.isActive ? (
                <div className="inline-flex items-center gap-3 rounded-full bg-meadow/10 px-4 py-3 text-sm font-semibold text-meadow">
                  <span className="size-2 rounded-full bg-meadow" />
                  {t.statusActive}
                </div>
              ) : (
                <SubscribeButton disabled={checkoutPending} label={checkoutPending ? t.loading : t.subscribe} onClick={() => void startCheckout()} />
              )}
            </div>
          </div>

          <aside className="relative m-4 rounded-[1.6rem] bg-ink p-7 text-white sm:m-6 sm:p-9 lg:m-8 lg:ml-0">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">{t.appName}</p>
            <h2 className="mt-3 text-2xl font-semibold">{subscription?.isActive ? t.statusActive : t.statusInactive}</h2>

            {subscription?.cancelAtPeriodEnd ? (
              <div className="mt-8 rounded-2xl border border-peach/30 bg-peach/10 p-5 text-sm leading-6 text-white/85">
                {t.cancellationScheduled.replace("{date}", endDate)}
              </div>
            ) : subscription?.isActive ? (
              <div className="mt-8">
                {showCancelConfirmation ? (
                  <div className="rounded-2xl border border-white/15 bg-white/5 p-5">
                    <p className="text-sm leading-6 text-white/75">{t.cancelSubscriptionConfirm}</p>
                    <div className="mt-5 flex flex-col gap-3">
                      <button type="button" disabled={cancelSubscription.isPending} onClick={() => void cancelRenewal()} className="min-h-11 rounded-full bg-peach px-4 text-sm font-semibold text-ink transition hover:bg-[#f5a06f] disabled:opacity-60">
                        {cancelSubscription.isPending ? t.cancelling : t.confirmCancellation}
                      </button>
                      <button type="button" disabled={cancelSubscription.isPending} onClick={() => setShowCancelConfirmation(false)} className="min-h-11 rounded-full border border-white/20 px-4 text-sm font-semibold transition hover:bg-white/10 disabled:opacity-60">
                        {t.keepSubscription}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button type="button" onClick={() => setShowCancelConfirmation(true)} className="min-h-11 rounded-full border border-white/25 px-5 text-sm font-semibold text-white transition hover:border-peach/60 hover:bg-white/10">
                    {t.cancelSubscription}
                  </button>
                )}
              </div>
            ) : (
              <p className="mt-6 text-sm leading-6 text-white/65">{t.activationPending}</p>
            )}

            {actionError ? <p className="mt-5 text-sm leading-6 text-[#ffd3c0]">{actionError}</p> : null}
          </aside>
        </div>
      </section>
    </main>
  );
}
