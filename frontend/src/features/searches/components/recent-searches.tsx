import type { RecentSearchesProps } from "@/features/searches";

export function RecentSearches({ emptyLabel, heading, onSelectSearch, searches }: RecentSearchesProps) {
  return (
    <section className="self-start rounded-card border border-white/70 bg-white/85 p-5 shadow-soft backdrop-blur-md sm:p-6">
      <h2 className="text-lg font-semibold">{heading}</h2>
      {searches.length === 0 ? (
        <p className="mt-4 text-sm leading-6 text-ink/70">{emptyLabel}</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {searches.map((search) => (
            <li key={search.id}>
              <button
                type="button"
                onClick={() => onSelectSearch(search.query)}
                className="flex min-h-12 w-full items-center justify-between gap-3 rounded-2xl border border-transparent bg-canvas px-4 py-3 text-left transition hover:border-oat hover:bg-oat/35 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meadow"
              >
                <span className="font-medium">{search.query}</span>
                <span className="text-xs uppercase tracking-[0.18em] text-ink/55">{search.language}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
