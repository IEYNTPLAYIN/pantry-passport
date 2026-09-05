"use client";

import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { defaultShouldDehydrateQuery, QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { useState } from "react";

import type { ProviderProps } from "@/types";

export function Providers({ children }: ProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            gcTime: 24 * 60 * 60 * 1000,
            retry: 1,
            staleTime: 30_000,
          },
        },
      }),
  );
  const [persister] = useState(() => createAsyncStoragePersister({
    storage: typeof window === "undefined" ? undefined : window.localStorage,
    key: "pantry-passport.query-cache",
    throttleTime: 1_000,
  }));

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: 24 * 60 * 60 * 1000,
        buster: "pantry-passport-v1",
        dehydrateOptions: {
          shouldDehydrateQuery: (query) => (
            defaultShouldDehydrateQuery(query) && query.meta?.persist === true
          ),
        },
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
