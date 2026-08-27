"use client";

import { useQuery } from "@tanstack/react-query";
import {
  SearchService,
  type TSearchResponse,
} from "@/lib/services/search-service";

/** Below this, results are noise. The backend enforces the same floor. */
export const MIN_SEARCH_LENGTH = 2;

export function useGlobalSearch(query: string, enabled = true) {
  const trimmed = query.trim();

  return useQuery<TSearchResponse>({
    queryKey: ["global-search", trimmed],
    queryFn: () => SearchService.search(trimmed),
    enabled: enabled && trimmed.length >= MIN_SEARCH_LENGTH,
    // Results for a given term are stable enough to reuse while the palette
    // is open — backspacing to a previous term should be instant, not a
    // second round trip.
    staleTime: 30_000,
    // A typo shouldn't cost three requests before the user sees the empty
    // state.
    retry: false,
    // Keeps the previous term's results on screen while the next request is
    // in flight, so the list doesn't blank out on every keystroke.
    placeholderData: (prev) => prev,
  });
}
