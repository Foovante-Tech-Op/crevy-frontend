"use client";

import { Building2, Smartphone } from "lucide-react";

export function PayoutSection({ isCorporate }: { isCorporate: boolean }) {
  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="border-b border-slate-200 pb-8">
        <h2 className="text-3xl font-serif text-slate-900 mb-2">
          {isCorporate ? "Settlement & Billing." : "Payout Vectors."}
        </h2>
        <p className="text-slate-500 text-xs font-mono uppercase tracking-widest">
          {isCorporate
            ? "Manage fiat and stablecoin acquisition channels."
            : "Institutional disbursement channels for climate yield."}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Fiat Vector */}
        <div className="p-8 border border-slate-200 bg-white">
          <Building2 className="mb-6 text-slate-900" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
            Primary Banking Instruction
          </p>
          <div className="p-4 bg-slate-50 border border-slate-200 font-mono text-sm font-bold text-slate-900 mb-6 tracking-widest">
            ECOBANK
          </div>
          <button
            type="button"
            className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 hover:text-emerald-900 transition-colors border-b border-emerald-700 pb-0.5"
          >
            Modify Fiat Vector
          </button>
        </div>

        {/* Digital Vector */}
        <div className="p-8 border border-slate-200 bg-white">
          <Smartphone className="mb-6 text-slate-900" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
            {isCorporate ? "USDC Treasury Wallet" : "Mobile Money Provider"}
          </p>
          <div className="p-4 bg-slate-50 border border-slate-200 font-mono text-[11px] font-bold text-slate-900 mb-6 break-all">
            {isCorporate ? "0x71C...976F" : "MTN GHANA // *** 5678"}
          </div>
          <button
            type="button"
            className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 hover:text-emerald-900 transition-colors border-b border-emerald-700 pb-0.5"
          >
            Modify Digital Vector
          </button>
        </div>
      </div>
    </div>
  );
}
