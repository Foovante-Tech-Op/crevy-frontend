"use client";

import {
  Download,
  ExternalLink,
  Filter,
  Plus,
  ShieldCheck,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/lib/utils";

export default function ContractsPage() {
  // ── Mock Data Mapped to Drizzle Schema ──
  const contracts = [
    {
      id: "CTR-2026-001",
      type: "project_offtake",
      party: "EcoLogic Systems",
      status: "active",
      date: "Jan 12, 2026",
      volume: "50,000",
      meth: "Blue Carbon",
    },
    {
      id: "CTR-2026-002",
      type: "credit_forward",
      party: "GreenGrowth SA",
      status: "draft",
      date: "May 05, 2026",
      volume: "12,000",
      meth: "Soil Carbon",
    },
    {
      id: "CTR-2026-003",
      type: "spot_purchase",
      party: "Crevy Institutional",
      status: "completed",
      date: "April 20, 2026",
      volume: "2,500",
      meth: "Reforestation",
    },
    {
      id: "CTR-2026-004",
      type: "farmer_offtake",
      party: "AgriCo Coop",
      status: "active",
      date: "June 02, 2026",
      volume: "8,400",
      meth: "Soil Carbon",
    },
  ];

  const chartData = [
    { type: "Offtake", volume: 58400 },
    { type: "Forward", volume: 12000 },
    { type: "Spot", volume: 2500 },
  ];

  return (
    <div className="animate-in fade-in duration-700 pb-24">
      {/* ── Editorial Header ── */}
      <div className="bg-white border-b border-slate-200 pt-12 pb-12">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
            <div className="max-w-2xl">
              <p className="text-slate-900 text-[10px] font-bold uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <ShieldCheck size={14} className="text-emerald-700" /> Legal
                Artifact Registry
              </p>
              <h1 className="text-4xl md:text-5xl font-serif text-slate-900 tracking-tight leading-none mb-4">
                Contract{" "}
                <span className="italic text-slate-500">Management.</span>
              </h1>
              <p className="text-slate-500 text-sm font-light leading-relaxed">
                Centralized governance of all institutional agreements,
                emissions rights, and credit deeds mapped to verified dMRV
                methodologies.
              </p>
            </div>
            <button
              type="button"
              className="shrink-0 bg-slate-900 hover:bg-emerald-900 text-white px-6 py-3 font-bold uppercase tracking-widest text-[10px] transition-colors flex items-center gap-2"
            >
              <Plus size={14} /> Initialize Agreement
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-12">
        {/* ── Visual Insights ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-1 bg-slate-900 text-white p-8 border border-slate-800 flex flex-col justify-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400 mb-2">
              Committed Inventory
            </p>
            <h2 className="text-5xl font-mono font-bold tracking-tight mb-2">
              72,900
              <span className="text-lg text-slate-400 ml-2 font-sans font-normal">
                tCO₂e
              </span>
            </h2>
            <p className="text-xs font-mono text-slate-400 border-t border-slate-800 pt-4 mt-4">
              Across 4 active agreements
            </p>
          </div>

          <div className="lg:col-span-2 bg-white border border-slate-200 p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-900">
                Volume by Contract Type
              </h3>
            </div>
            <div className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    stroke="#e2e8f0"
                  />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="type"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fontSize: 10,
                      fontFamily: "monospace",
                      fill: "#64748b",
                    }}
                    width={80}
                  />
                  <Tooltip
                    cursor={{ fill: "#f8fafc" }}
                    contentStyle={{
                      borderRadius: "0",
                      border: "1px solid #cbd5e1",
                      fontFamily: "monospace",
                      fontSize: "11px",
                    }}
                  />
                  <Bar dataKey="volume" fill="#0f172a" barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ── Contract Ledger ── */}
        <div className="bg-white border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900">
              Active Artifacts
            </h3>
            <button
              type="button"
              className="text-slate-400 hover:text-slate-900 transition-colors"
            >
              <Filter size={16} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[900px]">
              <thead>
                <tr className="border-b-2 border-slate-900">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900">
                    Reference ID
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900">
                    Agreement Type
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900">
                    Counterparty
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900">
                    Methodology
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900">
                    Status
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900 text-right">
                    Committed Vol.
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {contracts.map((con, i) => (
                  <tr
                    key={i}
                    className="hover:bg-slate-50 transition-colors group"
                  >
                    <td className="px-6 py-4 font-mono text-sm font-bold text-slate-900">
                      {con.id}
                    </td>
                    <td className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      {con.type.replace("_", " ")}
                    </td>
                    <td className="px-6 py-4 font-serif text-sm text-slate-900">
                      {con.party}
                    </td>
                    <td className="px-6 py-4 text-[11px] font-mono text-slate-500 uppercase tracking-widest">
                      {con.meth}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "px-2 py-1 text-[9px] font-bold uppercase tracking-widest border",
                          con.status === "active"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : con.status === "completed"
                              ? "bg-slate-100 text-slate-700 border-slate-300"
                              : "bg-amber-50 text-amber-700 border-amber-200",
                        )}
                      >
                        {con.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-sm font-bold text-slate-900">
                      {con.volume}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          className="p-2 text-slate-400 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-900 transition-colors"
                        >
                          <ExternalLink size={14} />
                        </button>
                        <button
                          type="button"
                          className="p-2 text-slate-400 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-900 transition-colors"
                        >
                          <Download size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
