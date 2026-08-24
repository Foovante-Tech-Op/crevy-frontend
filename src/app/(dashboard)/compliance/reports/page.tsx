"use client";

import { Download, FileText, Filter, Search, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ComplianceReportsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  // Empty until wired to real data. These were three invented reports, each
  // labelled "Verified" with a plausible reference and tonnage — the most
  // dangerous kind of placeholder on a compliance screen, since a buyer could
  // reasonably read them as genuine audit artifacts.
  const reports: {
    ref: string;
    period: string;
    amount: string;
    date: string;
    status: string;
  }[] = [];

  return (
    <div className="max-w-7xl mx-auto py-12 px-6 space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-slate-200 pb-12">
        <div className="max-w-2xl">
          <p className="text-brand-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
            <FileText size={14} /> Institutional Compliance Artifacts
          </p>
          <h1 className="text-5xl font-black text-slate-900 leading-[1.1] tracking-tighter uppercase italic">
            Compliance <br /> Reports
          </h1>
          <p className="text-slate-500 font-medium text-lg mt-6 leading-relaxed">
            Access and manage all generated ESG disclosure reports and impact
            assessments.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by reference or reporting window..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 rounded-2xl border-slate-200 focus:ring-brand-500/20"
            />
          </div>
          <Button
            variant="outline"
            className="h-12 px-6 rounded-2xl border-slate-200 font-bold text-xs gap-2"
          >
            <Filter size={16} /> Filter Results
          </Button>
        </div>

        <div className="bg-white border border-slate-200 rounded-[3rem] overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Registry Reference
                </th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Reporting Window
                </th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Institutional Impact
                </th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {reports.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-10 py-16 text-center text-sm text-slate-400"
                  >
                    No compliance reports yet. They'll appear here once credits
                    have been retired against your portfolio.
                  </td>
                </tr>
              )}
              {reports.map((row, i) => (
                <tr
                  key={i}
                  className="hover:bg-slate-50/50 transition-all group"
                >
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-all shadow-sm">
                        <FileText size={18} />
                      </div>
                      <div>
                        <p className="font-black text-slate-900 tracking-tighter uppercase italic">
                          {row.ref}
                        </p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1 italic">
                          Published: {row.date}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8 uppercase tracking-[0.15em] font-bold text-slate-500 text-[10px]">
                    {row.period}
                  </td>
                  <td className="px-10 py-8 text-slate-900 font-black tracking-tight">
                    {row.amount}
                  </td>
                  <td className="px-10 py-8 text-right">
                    <Button
                      variant="outline"
                      className="border-slate-200 text-slate-600 hover:bg-brand-600 hover:text-white px-6 py-2.5 h-auto rounded-xl transition-all font-black uppercase text-[10px] tracking-widest shadow-lg active:scale-95"
                    >
                      Download Artifact <Download size={14} className="ml-2" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-10 bg-slate-50 flex justify-center border-t border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3">
              <ShieldCheck size={16} className="text-brand-500" /> All artifacts
              are cryptographically hashed and anchored to Polygon Mainnet.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
