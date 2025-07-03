"use client";

import React, { useMemo } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export function ReactQueryProvider({ children }: React.PropsWithChildren) {
  const client = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            cacheTime: 1000 * 60 * 10, // 10 minutes
            refetchOnWindowFocus: false,
            retry: 0, // do not retry
          },
        },
      }),
    []
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
