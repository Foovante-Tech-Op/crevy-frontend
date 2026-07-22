"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { PlusCircle, UserRound } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AgentDeveloperService } from "@/lib/services/field-agent-service";

// F2 — Home screen. One prominent action + a short recent-activity list.
// No charts or analytics here on purpose — that's an admin concern, not a
// field agent one.

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  verified: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
};

export default function AgentHomePage() {
  const { data, isLoading } = useQuery({
    queryKey: ["agent-developers-mine", "recent"],
    queryFn: () => AgentDeveloperService.listMine({ limit: 5 }),
  });

  const recent = data?.data || [];

  return (
    <div className="space-y-6">
      <Link
        href="/agent/register"
        className="block rounded-xl bg-slate-900 hover:bg-slate-800 transition-colors text-white p-6"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/10">
            <PlusCircle className="h-6 w-6" />
          </div>
          <div>
            <div className="font-semibold text-lg leading-tight">
              Register a new developer
            </div>
            <div className="text-sm text-slate-300">
              Start the on-site registration form
            </div>
          </div>
        </div>
      </Link>

      <div>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
          Recent registrations
        </h2>

        {isLoading ? (
          <div className="text-sm text-slate-400 py-8 text-center">
            Loading…
          </div>
        ) : recent.length === 0 ? (
          <Card>
            <CardContent className="py-10 flex flex-col items-center text-center gap-2">
              <UserRound className="h-8 w-8 text-slate-300" strokeWidth={1.5} />
              <p className="text-slate-500 text-sm">
                No developers registered yet — tap the button above to add your
                first one.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {recent.map((dev) => (
              <Card key={dev.id}>
                <CardContent className="py-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-medium text-slate-900 truncate">
                      {dev.name}
                    </div>
                    <div className="text-xs text-slate-400">
                      {dev.code} ·{" "}
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

        {recent.length > 0 && (
          <Link
            href="/agent/registrations"
            className="block text-center text-sm font-medium text-slate-600 hover:text-slate-900 mt-4"
          >
            View all my registrations →
          </Link>
        )}
      </div>
    </div>
  );
}
