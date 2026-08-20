"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight, Search, UserRound } from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AgentDeveloperService } from "@/lib/services/field-agent-service";

// F4 — Searchable list of the agent's own submissions. Read-only: agents
// don't edit after submission — edits go through the admin/developer flow
// instead (matches the spec's F4 acceptance criteria).

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  verified: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
};

const PAGE_SIZE = 20;

// Mirrors the cursor-stack pattern used by (dashboard)/project-developers —
// the backend only supports forward cursors (nextCursor), so "back" means
// popping our own history of visited cursors rather than asking the API.
function useCursorPagination() {
  const [cursorStack, setCursorStack] = useState<(string | undefined)[]>([
    undefined,
  ]);
  const currentPage = cursorStack.length - 1;
  const currentCursor = cursorStack[currentPage];

  const goNext = useCallback(
    (nextCursor: string) => setCursorStack((s) => [...s, nextCursor]),
    [],
  );
  const goPrev = useCallback(
    () => setCursorStack((s) => (s.length > 1 ? s.slice(0, -1) : s)),
    [],
  );
  const resetToFirst = useCallback(() => setCursorStack([undefined]), []);

  return {
    currentPage,
    currentCursor,
    goNext,
    goPrev,
    resetToFirst,
    canGoPrev: currentPage > 0,
  };
}

export default function MyRegistrationsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<
    "all" | "pending" | "verified" | "rejected"
  >("all");
  const {
    currentPage,
    currentCursor,
    goNext,
    goPrev,
    resetToFirst,
    canGoPrev,
  } = useCursorPagination();

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["agent-developers-mine", search, status, currentCursor],
    queryFn: () =>
      AgentDeveloperService.listMine({
        search: search || undefined,
        status: status === "all" ? undefined : status,
        cursor: currentCursor,
        limit: PAGE_SIZE,
      }),
  });

  const developers = data?.data || [];
  const nextCursor = data?.nextCursor ?? null;
  const total = data?.total ?? 0;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-slate-900">My registrations</h1>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          placeholder="Search by name or code..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            resetToFirst();
          }}
          className="w-full rounded-none border border-slate-200 bg-white pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {(["all", "pending", "verified", "rejected"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => {
              setStatus(s);
              resetToFirst();
            }}
            className={`px-3.5 py-1.5 rounded-none text-xs font-medium whitespace-nowrap transition-colors ${
              status === s
                ? "bg-foreground text-white"
                : "bg-white text-slate-600 border border-slate-200"
            }`}
          >
            {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-sm text-slate-400 py-12 text-center">Loading…</div>
      ) : developers.length === 0 ? (
        <Card className="rounded-none">
          <CardContent className="py-10 flex flex-col items-center text-center gap-2">
            <UserRound className="h-8 w-8 text-slate-300" strokeWidth={1.5} />
            <p className="text-slate-500 text-sm">
              No registrations match this filter.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {developers.map((dev) => (
            <Link key={dev.id} href={`/agent/developers/${dev.code}`}>
              <Card className="rounded-none hover:border-slate-400 transition-colors">
                <CardContent className="py-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-medium text-slate-900 truncate">
                      {dev.name}
                    </div>
                    <div className="text-xs text-slate-400">
                      {dev.code} · {dev.entityType} ·{" "}
                      {format(new Date(dev.createdAt), "dd MMM yyyy")}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge
                      variant="outline"
                      className={STATUS_STYLES[dev.verificationStatus] || ""}
                    >
                      {dev.verificationStatus}
                    </Badge>
                    <ChevronRight className="h-4 w-4 text-slate-300" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {developers.length > 0 && (
        <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-200">
          <p className="text-xs text-slate-400">
            Page {currentPage + 1} · {developers.length}
            {total ? ` of ${total}` : ""}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={goPrev}
              disabled={!canGoPrev || isFetching}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 disabled:text-slate-300 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Prev
            </button>
            <button
              type="button"
              onClick={() => nextCursor && goNext(nextCursor)}
              disabled={!nextCursor || isFetching}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 disabled:text-slate-300 disabled:cursor-not-allowed"
            >
              Next <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
