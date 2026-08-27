"use client";

import { Settings, ShieldAlert } from "lucide-react";

/**
 * Registry governance thresholds.
 *
 * This panel used to accept edits, wait 1500ms on a setTimeout, and then
 * report `toast.success("Settings saved.")`. Nothing was sent anywhere and no
 * endpoint exists to receive it. A super_admin could set the AI confidence
 * threshold that gates MRV verification, be told it had been applied, and
 * change nothing — while the panel beside it asserted that "Actions are
 * irrevocably logged".
 *
 * Of the mocked screens in this app that was the one most likely to cause a
 * real decision to be made on a false premise, so the fake save is gone. The
 * values are shown as the defaults the pipeline currently applies, read-only,
 * with the panel stating plainly that it is not yet connected.
 *
 * When a real endpoint lands, this becomes a form again — the inputs, labels
 * and layout are all still here.
 */

/** The values the verification pipeline actually applies today. */
const CURRENT_THRESHOLDS = [
  {
    label: "AI Confidence Score Threshold (%)",
    value: 85,
    note: "Below this, an ingestion is flagged rather than verified.",
  },
  {
    label: "Maximum Buffer Deduction (%)",
    value: 20,
    note: "Upper bound on the non-permanence buffer withheld at issuance.",
  },
];

export function GovernanceSection({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  return (
    <div className="animate-in fade-in duration-500 space-y-12">
      <div className="border-b border-slate-200 pb-8">
        <h2 className="text-3xl font-sans text-slate-900 mb-2">
          Registry Governance.
        </h2>
        <p className="text-slate-500 text-xs font-mono uppercase tracking-widest">
          Thresholds applied by the verification pipeline.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="p-8 border border-slate-200 bg-white rounded-none">
          <div className="flex items-center gap-3 mb-8">
            <Settings size={16} className="text-slate-900" />
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900">
              Verification Parameters
            </h3>
          </div>

          {CURRENT_THRESHOLDS.map((t) => (
            <div key={t.label} className="mb-8 last:mb-0">
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 block">
                {t.label}
              </div>
              <div className="w-full bg-slate-50 border border-slate-200 rounded-none p-4 font-mono text-slate-900 font-bold">
                {t.value}
              </div>
              <p className="mt-2 text-[10px] font-mono text-slate-400 leading-relaxed">
                {t.note}
              </p>
            </div>
          ))}
        </div>

        <div className="p-8 border border-amber-200 bg-amber-50 rounded-none flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <ShieldAlert size={16} className="text-amber-700" />
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-900">
                Not Editable Here Yet
              </h3>
            </div>
            <p className="text-xs text-amber-800 leading-relaxed font-mono mb-6">
              These thresholds change verification behaviour for every project
              in the registry, so they are not editable from this screen until
              there is an endpoint that applies them and an audit record that
              proves who changed what. Until then this panel reports the values
              in force; it does not pretend to set them.
            </p>
          </div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-amber-900">
            {isSuperAdmin
              ? "Your clearance would permit this change"
              : "Requires super admin clearance"}
          </p>
        </div>
      </div>
    </div>
  );
}
