"use client";

import { useEffect, useState } from "react";

/**
 * Debounce a rapidly-changing value — a search input, typically — so it can
 * be used in a TanStack Query key without firing a request per keystroke.
 *
 * Extracted from AssignmentCheckModal, which held the only real debounce in
 * the codebase inline. Several list pages feed raw input state straight into
 * their query keys and issue a request per character as a result; they can
 * adopt this the next time they're touched.
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debounced;
}
