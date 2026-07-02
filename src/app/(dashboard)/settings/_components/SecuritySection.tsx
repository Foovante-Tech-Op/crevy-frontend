"use client";

import { Key, ShieldCheck, X } from "lucide-react";

export function SecuritySection() {
  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="border-b border-slate-200 pb-8">
        <h2 className="text-3xl font-sans text-slate-900 mb-2">
          Access & Security.
        </h2>
        <p className="text-slate-500 text-xs font-mono uppercase tracking-widest">
          Manage cryptographic sessions and authentication protocols.
        </p>
      </div>

      <div className="grid gap-8">
        {/* MFA Status */}
        <div className="p-8 border border-slate-200 bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
              <Key size={16} className="text-slate-900" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">
                Multi-Factor Authentication (MFA)
              </h4>
              <p className="text-xs font-mono text-slate-500">
                Security protocol anchored via Time-based OTP.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="px-4 py-2 bg-brand-50 text-brand-700 border border-brand-200 text-[10px] font-bold uppercase tracking-widest hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-colors"
          >
            Disable Protocol
          </button>
        </div>

        {/* Active Sessions */}
        <div className="border border-slate-200 bg-white">
          <div className="p-6 border-b border-slate-200 bg-slate-50">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900">
              Active Cryptographic Sessions
            </h4>
          </div>
          <div className="divide-y divide-slate-100">
            <div className="flex justify-between items-center p-6 hover:bg-slate-50 transition-colors">
              <div>
                <div className="font-sans text-sm font-bold text-slate-900 mb-1">
                  Mac OS / Chrome WebKit
                </div>
                <div className="font-mono text-[10px] text-slate-500 tracking-widest">
                  IP: 197.251.x.x / ACCRA, GH (CURRENT)
                </div>
              </div>
              <ShieldCheck size={18} className="text-brand-600" />
            </div>

            <div className="flex justify-between items-center p-6 hover:bg-slate-50 transition-colors group">
              <div>
                <div className="font-sans text-sm font-bold text-slate-900 mb-1">
                  iOS / Safari Mobile
                </div>
                <div className="font-mono text-[10px] text-slate-500 tracking-widest">
                  IP: 154.160.x.x / LONDON, UK
                </div>
              </div>
              <button
                type="button"
                className="p-2 border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-600 transition-colors opacity-0 group-hover:opacity-100"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
