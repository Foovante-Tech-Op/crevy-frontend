"use client";

import { Download, Landmark, Search } from "lucide-react";
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

export default function PayoutsPage() {
  const chartData = [
    { name: "JAN", amount: 4000, pending: 0 },
    { name: "FEB", amount: 3000, pending: 0 },
    { name: "MAR", amount: 5000, pending: 0 },
    { name: "APR", amount: 2000, pending: 0 },
    { name: "MAY", amount: 4500, pending: 1200 },
    { name: "JUN", amount: 6000, pending: 3400 },
  ];

  const payouts = [
    {
      ref: "PAY-2026-000142",
      entity: "Asante Farms",
      project: "PRJ-AGRI-001",
      method: "mobile_money",
      status: "completed",
      date: "Jun 06, 2026",
      amount: "1,240.00",
    },
    {
      ref: "PAY-2026-000143",
      entity: "Green Canopy Coop",
      project: "PRJ-FOR-092",
      method: "bank_transfer",
      status: "pending",
      date: "Jun 07, 2026",
      amount: "8,500.00",
    },
    {
      ref: "PAY-2026-000144",
      entity: "Biochar Collective",
      project: "PRJ-BIO-014",
      method: "mobile_money",
      status: "completed",
      date: "May 28, 2026",
      amount: "420.50",
    },
    {
      ref: "PAY-2026-000145",
      entity: "Oceanside Mangroves",
      project: "PRJ-BLU-003",
      method: "bank_transfer",
      status: "failed",
      date: "May 25, 2026",
      amount: "3,200.00",
    },
  ];

  return (
    <div className="animate-in fade-in duration-700 pb-24">
      {/* ── Editorial Header ── */}
      <div className="bg-white border-b border-slate-200 pt-12 pb-12">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
            <div className="max-w-2xl">
              <p className="text-slate-900 text-[10px] font-bold uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <Landmark size={14} className="text-brand-700" /> Disbursement
                Ledger
              </p>
              <h1 className="text-4xl md:text-5xl font-sans text-slate-900 tracking-tight leading-none mb-4">
                Payout <span className="italic text-slate-500">History.</span>
              </h1>
              <p className="text-slate-500 text-sm font-light leading-relaxed">
                Immutable tracking of all capital disbursements mapped to
                verified credit sales. Oversee mobile money and bank transfers
                to developers.
              </p>
            </div>

            <div className="bg-slate-900 text-white p-6 border border-slate-800 min-w-[240px] shrink-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-400 mb-2">
                Total Disbursed (FY26)
              </p>
              <h2 className="text-4xl font-mono font-bold tracking-tight mb-1">
                <span className="text-slate-500 font-sans mr-1">$</span>148,240
              </h2>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-12">
        {/* ── Liquidity Chart ── */}
        <div className="bg-white border border-slate-200 p-8 md:p-10 mb-12">
          <div className="flex justify-between items-end mb-8 border-b border-slate-100 pb-4">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-900">
              Capital Outflow Trajectory
            </h3>
            <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest">
              <span className="flex items-center gap-1.5 text-slate-900">
                <div className="w-2 h-2 bg-slate-900"></div> Settled
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <div className="w-2 h-2 bg-slate-300"></div> Pending
              </span>
            </div>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 10,
                    fontFamily: "monospace",
                    fill: "#64748b",
                  }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 10,
                    fontFamily: "monospace",
                    fill: "#64748b",
                  }}
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
                <Bar
                  dataKey="amount"
                  stackId="a"
                  fill="#0f172a"
                  barSize={32}
                  name="Settled"
                />
                <Bar
                  dataKey="pending"
                  stackId="a"
                  fill="#cbd5e1"
                  barSize={32}
                  name="Pending"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Transaction Table ── */}
        <div className="bg-white border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900">
              Disbursement Registry
            </h3>
            <div className="flex gap-3">
              <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 w-full md:w-64">
                <Search size={14} className="text-slate-400" />
                <input
                  placeholder="Search Reference ID"
                  className="bg-transparent border-none outline-none text-[10px] font-mono w-full"
                />
              </div>
              <button
                type="button"
                className="bg-white border border-slate-200 text-slate-900 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest hover:border-slate-900 transition-colors flex items-center gap-2"
              >
                <Download size={14} /> Export
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[900px]">
              <thead>
                <tr className="border-b-2 border-slate-900">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900">
                    Ref ID
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900">
                    Beneficiary
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900">
                    Vector
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900">
                    Status
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900">
                    Timestamp
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900 text-right">
                    Amount (USD)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payouts.map((pay, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-sm font-bold text-slate-900">
                      {pay.ref}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-sans text-sm text-slate-900">
                        {pay.entity}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mt-1">
                        {pay.project}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      {pay.method.replace("_", " ")}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "px-2 py-1 text-[9px] font-bold uppercase tracking-widest border",
                          pay.status === "completed"
                            ? "bg-brand-50 text-brand-700 border-brand-200"
                            : pay.status === "failed"
                              ? "bg-red-50 text-red-700 border-red-200"
                              : "bg-amber-50 text-amber-700 border-amber-200",
                        )}
                      >
                        {pay.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-[11px] text-slate-500 uppercase tracking-widest">
                      {pay.date}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-sm font-bold text-slate-900">
                      ${pay.amount}
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
