"use client";

import Link from "next/link";

import { getTranslations, useStoredLanguage } from "@/shared/i18n";

export default function SubscriptionSuccessPage() {
  const [language] = useStoredLanguage();
  const t = getTranslations(language);

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6 py-16">
      <section className="w-full rounded-card border border-white/60 bg-white/85 p-10 text-center shadow-soft backdrop-blur">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-meadow">{t.subscriptionSuccessEyebrow}</p>
        <h1 className="mt-4 text-4xl font-semibold">{t.subscriptionSuccessTitle}</h1>
        <p className="mt-4 text-lg text-ink/75">{t.subscriptionSuccessBody}</p>
        <Link
          href="/"
          className="mt-8 inline-flex rounded-full bg-meadow px-6 py-3 font-semibold text-white transition hover:bg-meadow/90"
        >
          {t.backHome}
        </Link>
      </section>
    </main>
  );
}
