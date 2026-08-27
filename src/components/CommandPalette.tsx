"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight, Clock, Loader2, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { getSidebarConfig } from "@/constants/sidebar-items";
import { useDebounce } from "@/hooks/use-debounce";
import { MIN_SEARCH_LENGTH, useGlobalSearch } from "@/hooks/use-search";
import type { SidebarItem } from "@/types/sidebar.types";
import type { TRole } from "@/types/user.types";

const RECENTS_KEY = "crevy:command-palette:recents";
const MAX_RECENTS = 5;

type Recent = { title: string; url: string };

type NavCommand = {
  title: string;
  url: string;
  icon: SidebarItem["icon"];
  group: string;
};

/**
 * Navigation commands come from getSidebarConfig(role) — the same source the
 * sidebar renders. Reusing it means the palette can never offer a route the
 * user's role isn't allowed to see, and a nav change lands in both places at
 * once. Writing a second route list here is how those two drift apart.
 */
const buildNavCommands = (role: TRole): NavCommand[] => {
  const config = getSidebarConfig(role);

  const top = config.topItems.map((i) => ({
    title: i.title,
    url: i.url,
    icon: i.icon,
    group: "Go to",
  }));

  const sectioned = (config.sections ?? []).flatMap((section) =>
    section.items.map((i) => ({
      title: i.title,
      url: i.url,
      icon: i.icon,
      group: section.title ?? "Go to",
    })),
  );

  return [...top, ...sectioned];
};

/**
 * Local matcher.
 *
 * The dialog runs with shouldFilter={false} so cmdk does not re-filter the
 * server's results, which means local commands need their own matching.
 * Subsequence rather than substring, so "usrmgmt" finds "User Management" the
 * way a fuzzy palette is expected to.
 */
const matches = (haystack: string, needle: string) => {
  if (!needle) return true;
  const h = haystack.toLowerCase();
  const n = needle.toLowerCase().replace(/\s+/g, "");
  if (h.includes(n)) return true;

  let i = 0;
  for (const ch of h) {
    if (ch === n[i]) i++;
    if (i === n.length) return true;
  }
  return false;
};

const readRecents = (): Recent[] => {
  try {
    const raw = localStorage.getItem(RECENTS_KEY);
    return raw ? (JSON.parse(raw) as Recent[]) : [];
  } catch {
    // Private windows and blocked site data both throw here.
    return [];
  }
};

export function CommandPalette({
  open,
  onOpenChange,
  role,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: TRole;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [recents, setRecents] = useState<Recent[]>([]);

  const debouncedQuery = useDebounce(query, 250);

  const { data, isFetching, isError } = useGlobalSearch(debouncedQuery, open);

  const navCommands = useMemo(() => buildNavCommands(role), [role]);

  const filteredNav = useMemo(
    () => navCommands.filter((c) => matches(c.title, query)).slice(0, 6),
    [navCommands, query],
  );

  // Read on open rather than on mount: localStorage is not available during
  // SSR, and the list may have changed in another tab.
  useEffect(() => {
    if (open) setRecents(readRecents());
  }, [open]);

  // Clear the query when the palette closes, so reopening starts fresh rather
  // than showing the last search's results.
  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const go = useCallback(
    (item: Recent) => {
      const next = [
        item,
        ...readRecents().filter((r) => r.url !== item.url),
      ].slice(0, MAX_RECENTS);

      try {
        localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
      } catch {
        // Not being able to remember a recent is not worth failing navigation.
      }

      onOpenChange(false);
      router.push(item.url);
    },
    [onOpenChange, router],
  );

  const serverGroups = data?.groups ?? [];
  const hasServerResults = serverGroups.length > 0;
  const isTooShort = debouncedQuery.trim().length < MIN_SEARCH_LENGTH;
  const showRecents = query.length === 0 && recents.length > 0;

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Search Crevy"
      description="Search projects, developers, organizations and people, or jump to a page."
      // The server has already matched; cmdk must not second-guess it.
      shouldFilter={false}
      className="max-w-2xl"
    >
      <CommandInput
        placeholder="Search projects, developers, people — or jump to a page..."
        value={query}
        onValueChange={setQuery}
      />

      <CommandList className="max-h-[420px]">
        {showRecents && (
          <CommandGroup heading="Recent">
            {recents.map((r) => (
              <CommandItem
                key={r.url}
                value={`recent-${r.url}`}
                onSelect={() => go(r)}
              >
                <Clock className="text-slate-400" />
                <span>{r.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {filteredNav.length > 0 && (
          <>
            {showRecents && <CommandSeparator />}
            <CommandGroup heading="Go to">
              {filteredNav.map((c) => (
                <CommandItem
                  key={c.url}
                  value={`nav-${c.url}`}
                  onSelect={() => go({ title: c.title, url: c.url })}
                >
                  <HugeiconsIcon
                    icon={c.icon}
                    size={18}
                    color="currentColor"
                    strokeWidth={1.5}
                  />
                  <span>{c.title}</span>
                  <ArrowRight className="ml-auto text-slate-300" />
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {serverGroups.map((group) => (
          <CommandGroup key={group.type} heading={group.label}>
            {group.results.map((r) => (
              <CommandItem
                key={`${group.type}-${r.id}`}
                value={`${group.type}-${r.id}`}
                onSelect={() => go({ title: r.title, url: r.url })}
              >
                <Search className="text-slate-400" />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate">{r.title}</span>
                  {r.subtitle && (
                    <span className="truncate text-xs text-slate-400">
                      {r.subtitle}
                    </span>
                  )}
                </div>
                {r.badge && (
                  <span className="ml-auto shrink-0 font-mono text-[10px] uppercase tracking-widest text-slate-400">
                    {r.badge.replace(/_/g, " ")}
                  </span>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        ))}

        {/*
          Four distinct states, deliberately. A search that FAILED must not
          render as "no results" — that tells the user the thing they're
          looking for doesn't exist, which is a different and wrong answer.
        */}
        {isError && (
          <div className="py-8 text-center font-mono text-[10px] uppercase tracking-widest text-amber-600">
            Search is unavailable right now — this is not "no results"
          </div>
        )}

        {!isError && isFetching && !hasServerResults && !isTooShort && (
          <div className="flex items-center justify-center gap-2 py-8 font-mono text-[10px] uppercase tracking-widest text-slate-400">
            <Loader2 className="h-3 w-3 animate-spin" /> Searching...
          </div>
        )}

        {!isError &&
          !isFetching &&
          !hasServerResults &&
          !isTooShort &&
          filteredNav.length === 0 && (
            <CommandEmpty>No results for "{debouncedQuery}".</CommandEmpty>
          )}

        {!showRecents && isTooShort && filteredNav.length === 0 && (
          <div className="py-8 text-center font-mono text-[10px] uppercase tracking-widest text-slate-400">
            Type at least {MIN_SEARCH_LENGTH} characters
          </div>
        )}
      </CommandList>
    </CommandDialog>
  );
}
