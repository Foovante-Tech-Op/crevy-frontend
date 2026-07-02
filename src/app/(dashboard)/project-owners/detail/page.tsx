"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

import {
  type ProjectOwnerRecord,
  ProjectOwnerService,
} from "@/lib/services/project-owner-service";
import { cn } from "@/lib/utils";

// ─── Editorial Configs ────────────────────────────────────────────────────────

const verificationConfig: Record<
  string,
  { label: string; className: string; bg: string; dot: string }
> = {
  pending: {
    label: "Pending KYC",
    className: "text-amber-700",
    bg: "bg-amber-50 border-amber-200",
    dot: "bg-amber-500",
  },
  verified: {
    label: "Verified Entity",
    className: "text-brand-800",
    bg: "bg-brand-50 border-brand-200",
    dot: "bg-brand-500",
  },
  rejected: {
    label: "KYC Failed",
    className: "text-red-700",
    bg: "bg-red-50 border-red-200",
    dot: "bg-red-500",
  },
};

const getInitials = (first?: string, last?: string) =>
  `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase() || "PO";

// Editorial Mono-spaced Info Row
function _InfoRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value?: string | null;
  mono?: boolean;
}) {
  if (!value) return null;
  return (
    <div className="grid grid-cols-12 gap-4 py-4 border-b border-slate-200 last:border-0">
      <div className="col-span-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center">
        {label}
      </div>
      <div
        className={cn(
          "col-span-8 text-sm font-semibold text-slate-900",
          mono && "font-mono",
        )}
      >
        {value}
      </div>
    </div>
  );
}

// ─── Main Content Component ──────────────────────────────────────────────────

function ProjectOwnerDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["project-owner", userId],
    queryFn: () => ProjectOwnerService.getProjectOwner(userId!),
    enabled: !!userId,
  });

  const owner: ProjectOwnerRecord | undefined = data?.data;

  if (isLoading) {
    return (
      <div className="min-h-screen pt-40 flex flex-col items-center text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <span className="text-[10px] font-mono uppercase tracking-[0.2em]">
          Extracting KYC Dossier...
        </span>
      </div>
    );
  }

  if (isError || !owner) {
    return (
      <div className="min-h-screen pt-40 flex flex-col items-center text-center">
        <XCircle className="h-10 w-10 text-red-500 mb-4" />
        <p className="font-sans text-xl text-slate-900 mb-2">
          Dossier Retrieval Failed
        </p>
        <Link
          href="/project-owners"
          className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 border-b border-slate-900 pb-0.5"
        >
          Return to Directory
        </Link>
      </div>
    );
  }

  const vc =
    verificationConfig[owner.verificationStatus] ?? verificationConfig.pending;

  return (
    <div className="animate-in fade-in duration-700 pb-24">
      {/* ── Editorial Header ── */}
      <div className="bg-white border-b border-slate-200 pt-12 pb-12">
        <div className="max-w-250 mx-auto px-6 lg:px-10">
          <button
            type="button"
            onClick={() => router.push("/project-owners")}
            className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors mb-8"
          >
            <ArrowLeft className="w-3 h-3" /> Personnel Roster
          </button>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-slate-900 text-white flex items-center justify-center text-2xl font-sans">
                {getInitials(owner.firstName, owner.lastName)}
              </div>
              <div>
                <h1 className="text-4xl font-sans text-slate-900 tracking-tight leading-none mb-3">
                  {owner.firstName} {owner.lastName}
                </h1>
                <div className="flex items-center gap-4">
                  <span className="text-[11px] font-mono text-slate-500 uppercase tracking-[0.2em]">
                    ID: {owner.code}
                  </span>
                  <span
                    className={cn(
                      "px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 border",
                      vc.bg,
                      vc.className,
                    )}
                  >
                    <span
                      className={cn("w-1.5 h-1.5 rounded-full", vc.dot)}
                    ></span>
                    {vc.label}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* ... (rest of the page body) */}
    </div>
  );
}

export default function ProjectOwnerDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <Loader2 className="w-10 h-10 text-slate-900 animate-spin" />
        </div>
      }
    >
      <ProjectOwnerDetailContent />
    </Suspense>
  );
}
