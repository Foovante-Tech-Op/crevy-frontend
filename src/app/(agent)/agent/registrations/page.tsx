"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Search, UserRound } from "lucide-react";
import { useState } from "react";
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

export default function MyRegistrationsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<
    "all" | "pending" | "verified" | "rejected"
  >("all");

  const { data, isLoading } = useQuery({
    queryKey: ["agent-developers-mine", search, status],
    queryFn: () =>
      AgentDeveloperService.listMine({
        search: search || undefined,
        status: status === "all" ? undefined : status,
        limit: 50,
      }),
  });

  const developers = data?.data || [];

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-slate-900">My registrations</h1>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          placeholder="Search by name or code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-none border border-slate-200 bg-white pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {(["all", "pending", "verified", "rejected"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatus(s)}
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
            <Card key={dev.id} className="rounded-none">
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
                <Badge
                  variant="outline"
                  className={STATUS_STYLES[dev.verificationStatus] || ""}
                >
                  {dev.verificationStatus}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
