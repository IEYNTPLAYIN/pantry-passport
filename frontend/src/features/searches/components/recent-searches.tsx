import type { RecentSearchesProps } from '@/features/searches'

export function RecentSearches({
  emptyLabel,
  heading,
  onSelectSearch,
  searches,
}: RecentSearchesProps) {
  return (
    <section
      className="absolute left-0 right-0 top-full z-[100] mt-3 max-h-80 overflow-y-auto rounded-[1.4rem] border border-oat/65 bg-white/95 p-2 shadow-[0_22px_60px_rgba(25,54,45,0.2)] backdrop-blur-xl"
      aria-label={heading}
    >
      <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-ink/45">
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          className="size-4"
        >
          <path d="M10 5v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="10" cy="10" r="7" />
        </svg>
        <h2>{heading}</h2>
      </div>
      {searches.length === 0 ? (
        <p className="px-3 py-3 text-sm leading-6 text-ink/55">{emptyLabel}</p>
      ) : (
        <ul>
          {searches.map((search) => (
            <li key={search.id}>
              <button
                type="button"
                onClick={() => onSelectSearch(search.query)}
                className="group flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition hover:bg-oat/35 focus-visible:bg-oat/35 focus-visible:outline-none"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  className="size-4 shrink-0 text-ink/35 transition group-hover:text-meadow"
                >
                  <path
                    d="M10 5v5l3 2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="10" cy="10" r="7" />
                </svg>
                <span className="min-w-0 flex-1 truncate font-medium text-ink/80">
                  {search.query}
                </span>
                <span className="rounded-md bg-canvas px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-ink/45">
                  {search.language}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
