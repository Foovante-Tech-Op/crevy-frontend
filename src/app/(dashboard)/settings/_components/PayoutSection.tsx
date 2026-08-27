"use client";

import { Building2, Smartphone } from "lucide-react";
import Link from "next/link";

/**
 * Payout routing.
 *
 * The three values shown here were invented: "ECOBANK" as a banking
 * instruction, "MTN GHANA // *** 5678" as a mobile money account, and
 * "0x71C...976F" as a USDC treasury wallet — each above a "Modify" button
 * with no handler.
 *
 * Of everything mocked in this app that was the most dangerous, because it is
 * the screen someone checks to answer "where is my money going?". A masked
 * account number is exactly the shape people trust without reading twice.
 *
 * These are not wired to a source yet. Bank and mobile money details live on
 * `project_developer` (bankDetails / momoDetails) and are captured through
 * the complete-profile flow, not here — so this points there instead of
 * rendering a value it cannot stand behind.
 */

function Vector({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="p-8 border border-slate-200 bg-white rounded-none">
      <div className="mb-6 text-slate-400">{icon}</div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
        {label}
      </p>
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-none font-mono text-xs text-slate-400 italic mb-6">
        Not configured
      </div>
      {children}
    </div>
  );
}

export function PayoutSection({ isCorporate }: { isCorporate: boolean }) {
  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="border-b border-slate-200 pb-8">
        <h2 className="text-3xl font-sans text-slate-900 mb-2">
          {isCorporate ? "Settlement & Billing." : "Payout Vectors."}
        </h2>
        <p className="text-slate-500 text-xs font-mono uppercase tracking-widest">
          {isCorporate
            ? "Fiat and stablecoin settlement channels."
            : "Where disbursements are sent."}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Vector icon={<Building2 />} label="Primary Banking Instruction">
          {isCorporate ? (
            <p className="text-[10px] font-mono text-slate-400 leading-relaxed">
              Settlement accounts are arranged with the Crevy team.
            </p>
          ) : (
            <Link
              href="/profile/complete"
              className="text-[10px] font-bold uppercase tracking-widest text-brand-700 hover:text-brand-900 transition-colors border-b border-brand-700 pb-0.5"
            >
              Add bank details
            </Link>
          )}
        </Vector>

        <Vector
          icon={<Smartphone />}
          label={isCorporate ? "USDC Treasury Wallet" : "Mobile Money Account"}
        >
          {isCorporate ? (
            <p className="text-[10px] font-mono text-slate-400 leading-relaxed">
              Stablecoin settlement is not enabled on this account.
            </p>
          ) : (
            <Link
              href="/profile/complete"
              className="text-[10px] font-bold uppercase tracking-widest text-brand-700 hover:text-brand-900 transition-colors border-b border-brand-700 pb-0.5"
            >
              Add mobile money details
            </Link>
          )}
        </Vector>
      </div>

      <p className="text-xs text-slate-500 leading-relaxed border-t border-slate-200 pt-8">
        Payout details are captured during profile completion. Reading and
        editing them from this screen is not wired up yet — until it is, this
        panel will not display an account it cannot verify is yours.
      </p>
    </div>
  );
}
