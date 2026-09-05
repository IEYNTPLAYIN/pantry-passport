import type { RecentSearchesProps } from "@/features/searches";

export function RecentSearches({ emptyLabel, heading, onSelectSearch, searches }: RecentSearchesProps) {
  return (
    <section className="rounded-card border border-white/60 bg-white/85 p-6 shadow-soft backdrop-blur">
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
                className="flex w-full items-center justify-between rounded-2xl bg-canvas px-4 py-3 text-left transition hover:bg-oat/35"
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
