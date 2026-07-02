"use client";

import { ArrowLeft, Building2, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

// ─── Data & Configuration ─────────────────────────────────────────────────────

const _scopeData = [
  { name: "Scope 1", value: 45, fill: "#047857" }, // brand-700
  { name: "Scope 2", value: 25, fill: "#0f172a" }, // slate-900
  { name: "Scope 3", value: 30, fill: "#94a3b8" }, // slate-400
];

const _members = [
  {
    id: "USR-001",
    name: "Sarah Jenkins",
    role: "Sustainability Director",
    email: "s.jenkins@ecologic.com",
    status: "active",
  },
  {
    id: "USR-002",
    name: "Marcus Vane",
    role: "ESG Analyst",
    email: "m.vane@ecologic.com",
    status: "active",
  },
  {
    id: "USR-003",
    name: "Elena Rossi",
    role: "Financial Controller",
    email: "e.rossi@ecologic.com",
    status: "inactive",
  },
];

function OrganizationDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [_isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="animate-in fade-in duration-700 pb-24 font-sans bg-slate-50 min-h-screen">
      {/* ── Editorial Header ── */}
      <div className="border-b border-slate-200 bg-white pt-12 pb-12">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="text-left">
              <button
                type="button"
                onClick={() => router.push("/organizations")}
                className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] flex items-center gap-2 mb-8 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft size={14} /> Back to Registry
              </button>
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="w-8 h-[1px] bg-slate-900"></div>
                <span className="text-slate-900 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                  <Building2 size={14} className="text-brand-700" />{" "}
                  Institutional Profile
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-sans text-slate-900 tracking-tight leading-none mb-4">
                EcoLogic <span className="italic text-slate-500">Systems.</span>
              </h1>
              <p className="text-slate-500 text-sm max-w-xl leading-relaxed font-light">
                Strategic sustainability partner based in Accra, Ghana. Focused
                on Nature-Based Solutions and Regenerative Agriculture offsets.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-12">
        {/* Placeholder for content... */}
        <p className="text-slate-500">Displaying organization {id}</p>
      </div>
    </div>
  );
}

export default function OrganizationDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <Loader2 className="w-10 h-10 text-slate-900 animate-spin" />
        </div>
      }
    >
      <OrganizationDetailContent />
    </Suspense>
  );
}
