"use client";

import { ArrowRight, FileSignature, Landmark } from "lucide-react";
import Link from "next/link";

export default function FinancialsDashboard() {
  return (
    <div className="animate-in fade-in duration-700 pb-24 font-sans selection:bg-brand selection:text-slate-900">
      {/* ── Simplified Header ── */}
      <div className="bg-white border-b border-slate-200 pt-14 pb-16">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="inline-flex items-center gap-3 mb-6">
            <span className="w-2 h-2 bg-brand rounded-none" />
            <span className="text-slate-900 text-[10px] font-mono font-bold tracking-[0.2em] uppercase">
              Financial Overview
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight mb-6 leading-none">
            Financial{" "}
            <span className="italic font-light text-slate-400">Control.</span>
          </h1>
          <p className="text-slate-500 text-sm max-w-2xl leading-relaxed font-light">
            Track payouts, contract agreements, and available funds for carbon
            credits registered on Crevy.
          </p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-12">
        {/* ── Clear Metrics Panel ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-slate-200 border border-slate-200 mb-12 rounded-none">
          {/* Card 1 */}
          <div className="bg-white p-8 rounded-none">
            <p className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">
              Total Volume Managed
            </p>
            <h2 className="text-4xl font-mono text-slate-900 font-bold tracking-tight tabular-nums">
              142,500
              <span className="text-xs text-slate-400 ml-2 font-sans font-normal uppercase tracking-wider">
                tCO₂e
              </span>
            </h2>
            <p className="text-[10px] font-mono font-bold uppercase tracking-[0.15em] text-slate-900 mt-4">
              +12% growth this year
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-8 rounded-none">
            <p className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">
              Total Paid Out (2026)
            </p>
            <h2 className="text-4xl font-mono text-slate-900 font-bold tracking-tight tabular-nums">
              <span className="text-slate-400 font-sans mr-0.5 font-normal">
                $
              </span>
              2.4M
            </h2>
            <p className="text-[10px] font-mono font-bold uppercase tracking-[0.15em] text-slate-400 mt-4">
              Successfully Transferred
            </p>
          </div>

          {/* Card 3 - Accent Highlight Block */}
          <div className="bg-slate-950 p-8 text-white relative overflow-hidden rounded-none">
            <div className="relative z-10">
              <p className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-brand mb-2">
                Pending Payments
              </p>
              <h2 className="text-4xl font-mono text-white font-bold tracking-tight tabular-nums">
                <span className="text-brand font-sans mr-0.5 font-normal">
                  $
                </span>
                42,150
              </h2>
              <p className="text-[10px] font-mono font-bold uppercase tracking-[0.15em] text-brand mt-4">
                Awaiting Transfer
              </p>
            </div>
          </div>
        </div>

        {/* ── Navigation Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Payouts Module */}
          <Link
            href="/financials/payouts"
            className="group border border-slate-200 bg-white hover:border-slate-900 transition-colors flex flex-col justify-between p-10 min-h-[320px] rounded-none"
          >
            <div>
              <div className="w-12 h-12 bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-900 mb-8 group-hover:bg-slate-950 group-hover:text-white group-hover:border-slate-950 transition-colors rounded-none">
                <Landmark size={20} strokeWidth={1.5} />
              </div>
              <h3 className="text-3xl font-bold text-slate-900 tracking-tight mb-4">
                Payout Ledger
                <span className="text-brand group-hover:text-slate-900 transition-colors">
                  .
                </span>
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed font-light max-w-md">
                View and manage payout records to project developers. Track
                mobile money and bank transfers for completed credit sales.
              </p>
            </div>
            <div className="mt-8 flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900">
              Open Ledger{" "}
              <ArrowRight
                size={12}
                className="group-hover:translate-x-1 transition-transform text-brand"
              />
            </div>
          </Link>

          {/* Contracts Module */}
          <Link
            href="/financials/contracts"
            className="group border border-slate-200 bg-white hover:border-slate-900 transition-colors flex flex-col justify-between p-10 min-h-[320px] rounded-none"
          >
            <div>
              <div className="w-12 h-12 bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-900 mb-8 group-hover:bg-slate-950 group-hover:text-white group-hover:border-slate-950 transition-colors rounded-none">
                <FileSignature size={20} strokeWidth={1.5} />
              </div>
              <h3 className="text-3xl font-bold text-slate-900 tracking-tight mb-4">
                Contract Registry
                <span className="text-brand group-hover:text-slate-900 transition-colors">
                  .
                </span>
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed font-light max-w-md">
                View and manage legal agreements, forward purchase contracts,
                and credit delivery milestones.
              </p>
            </div>
            <div className="mt-8 flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900">
              Open Registry{" "}
              <ArrowRight
                size={12}
                className="group-hover:translate-x-1 transition-transform text-brand"
              />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
