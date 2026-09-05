import Link from 'next/link'

import type { PremiumAccessLinkProps } from '@/features/subscription'

export function PremiumAccessLink({
  isActive,
  isLoading,
  activateLabel,
  crownLabel,
}: PremiumAccessLinkProps) {
  if (isLoading) {
    return (
      <div
        className="h-12 animate-pulse rounded-full bg-oat/35"
        aria-label="Loading subscription status"
      />
    )
  }

  return (
    <Link
      href="/subscription"
      aria-label={isActive ? crownLabel : activateLabel}
      className={`inline-flex min-h-12 shrink-0 items-center justify-center rounded-full font-semibold shadow-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-peach ${
        isActive
          ? 'self-center bg-peach px-4 text-ink hover:bg-[#f5a06f]'
          : 'bg-ink px-5 text-white hover:bg-meadow'
      }`}
    >
      {isActive ? (
        <svg
          aria-hidden="true"
          viewBox="0 0 32 32"
          fill="none"
          className="size-6"
        >
          <path
            d="m5 11 6 5 5-9 5 9 6-5-2.2 13H7.2L5 11Z"
            fill="currentColor"
          />
          <path
            d="M8 27h16"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle cx="5" cy="9" r="2" fill="currentColor" />
          <circle cx="16" cy="5" r="2" fill="currentColor" />
          <circle cx="27" cy="9" r="2" fill="currentColor" />
        </svg>
      ) : (
        <>
          <svg
            aria-hidden="true"
            viewBox="0 0 32 32"
            fill="none"
            className="mr-2 size-5 text-peach"
          >
            <path
              d="m5 11 6 5 5-9 5 9 6-5-2.2 13H7.2L5 11Z"
              fill="currentColor"
            />
            <path
              d="M8 27h16"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
          {activateLabel}
        </>
      )}
    </Link>
  )
}
