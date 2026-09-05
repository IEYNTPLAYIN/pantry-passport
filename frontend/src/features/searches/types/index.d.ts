import type { RecentSearch } from "@/types";

export type RecentSearchResponse = {
  searches: RecentSearch[];
};

export type RecentSearchesProps = {
  emptyLabel: string;
  heading: string;
  onSelectSearch: (query: string) => void;
  searches: RecentSearch[];
};

export type { RecentSearch };
