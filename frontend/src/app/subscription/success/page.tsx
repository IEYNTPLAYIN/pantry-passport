'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useRef } from 'react'

import { useSyncSubscription } from '@/features/subscription'
import { getTranslations, useStoredLanguage } from '@/shared/i18n'

function SubscriptionSuccessContent() {
  const [language] = useStoredLanguage()
  const t = getTranslations(language)
  const searchParams = useSearchParams()
  const syncSubscription = useSyncSubscription()
  const hasRequestedSync = useRef(false)

  useEffect(() => {
    if (hasRequestedSync.current) {
      return
    }

    hasRequestedSync.current = true
    syncSubscription.mutate(searchParams.get('session_id') ?? undefined)
  }, [searchParams, syncSubscription])

  const isActive = syncSubscription.data?.isActive === true
  const title = isActive ? t.statusActive : t.subscriptionSuccessTitle
  const body = syncSubscription.isError
    ? t.activationPending
    : t.subscriptionSuccessBody

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6 py-16">
      <section className="w-full rounded-card border border-white/60 bg-white/85 p-10 text-center shadow-soft backdrop-blur">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-meadow">
          {t.subscriptionSuccessEyebrow}
        </p>
        <h1 className="mt-4 text-4xl font-semibold">{title}</h1>
        <p className="mt-4 text-lg text-ink/75" aria-live="polite">
          {body}
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex rounded-full bg-meadow px-6 py-3 font-semibold text-white transition hover:bg-meadow/90"
        >
          {t.backHome}
        </Link>
      </section>
    </main>
  )
}

export default function SubscriptionSuccessPage() {
  return (
    <Suspense fallback={<main className="min-h-screen" aria-busy="true" />}>
      <SubscriptionSuccessContent />
    </Suspense>
  )
}
