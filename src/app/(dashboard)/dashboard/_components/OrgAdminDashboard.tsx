"use client";

import { motion } from "framer-motion";
import { BarChart2, DollarSign, Globe, Target } from "lucide-react";
import Link from "next/link";
import { SectionLabel, StatCard } from "./Shared";

// ─── REUSABLE GAUGE (Institutional) ───
function NetZeroGauge({
  pct,
  goal,
  current,
  unit,
}: {
  pct: number;
  goal: number;
  current: number;
  unit: string;
}) {
  const color = pct < 50 ? "#f59e0b" : pct < 80 ? "#2cc295" : "#178a74";
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white border border-slate-200 h-full">
      <div className="relative w-48 h-24 overflow-hidden mb-8 mt-4">
        <div className="absolute top-0 left-0 w-48 h-48 rounded-full border-[1px] border-slate-200 border-dashed" />
        <div className="absolute top-2 left-2 w-44 h-44 rounded-full border-[8px] border-slate-100" />
        <div
          className="absolute top-2 left-2 w-44 h-44 rounded-full border-[8px] border-transparent transition-all duration-1000 ease-out"
          style={{
            borderColor: color,
            clipPath: "polygon(0 50%, 100% 50%, 100% 100%, 0 100%)",
            transform: `rotate(${pct * 1.8 - 90}deg)`,
          }}
        />
        <div className="absolute bottom-0 left-0 w-full text-center pb-0">
          <span className="font-mono text-4xl font-bold text-slate-900 tracking-tight">
            {pct}%
          </span>
        </div>
      </div>
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 text-center">
        <span className="text-slate-900">{current.toLocaleString()}</span> of{" "}
        {goal.toLocaleString()} {unit} neutralized
      </p>
    </div>
  );
}

export default function OrgAdminDashboard({
  userName,
  role,
}: {
  userName: string;
  role: string;
}) {
  const isAuditor = role === "org_auditor";

  return (
    <div className="max-w-[1400px] mx-auto py-12 px-6 lg:px-10 font-sans selection:bg-slate-900 selection:text-white bg-slate-50 min-h-screen">
      {/* ── 1. Corporate Hero ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white border border-slate-200 p-10 md:p-14 mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-8"
      >
        <div className="max-w-2xl">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-4">
            {isAuditor
              ? "Compliance Auditor · Read Only"
              : "Institutional ESG Centre"}
          </p>
          <h1 className="text-4xl md:text-5xl font-sans text-slate-900 tracking-tight leading-none mb-4">
            Corporate Carbon{" "}
            <span className="italic text-slate-500">Portfolio.</span>
          </h1>
          <p className="text-slate-500 font-light leading-relaxed">
            Manage your organization's carbon exposure, track progress toward
            net-zero obligations, and generate compliant ESG reporting
            artifacts.
          </p>
        </div>
        {!isAuditor && (
          <Link
            href="/marketplace"
            className="shrink-0 bg-slate-900 text-white px-8 py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-brand-900 transition-colors"
          >
            Acquire Verified Yield
          </Link>
        )}
      </motion.div>

      {/* ── 2. ESG Portfolio KPIs ── */}
      <div className="mb-16">
        <SectionLabel label="Exposure & Compliance Metrics" delay={0.1} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-slate-200 border border-slate-200">
          <StatCard
            label="Total CO₂e Offset"
            value="12,450"
            unit="t"
            icon={Globe}
            trend="+18% vs Q1"
            delay={0.15}
          />
          <StatCard
            label="Portfolio Value"
            value="$84,000"
            unit="USD"
            icon={DollarSign}
            trend="+11% vs Q1"
            delay={0.2}
          />
          <StatCard
            label="ESG Trust Score"
            value="9.1"
            unit="/ 10"
            icon={BarChart2}
            trend="+0.4 pts"
            delay={0.25}
          />
          <StatCard
            label="Net-Zero Trajectory"
            value="80"
            unit="%"
            icon={Target}
            trend="+12% YTD"
            delay={0.3}
          />
        </div>
      </div>

      {/* ── 3. Impact Analytics ── */}
      <div className="mb-16">
        <SectionLabel label="Impact & Trajectory Analytics" delay={0.35} />

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          <div className="bg-white border border-slate-200 p-8 h-[300px]">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-6 border-b border-slate-100 pb-2">
              Asset Distribution
            </h3>
            <div className="h-full flex items-center justify-center font-mono text-xs text-slate-400 border border-dashed border-slate-200 bg-slate-50">
              [DonutChart Component]
            </div>
          </div>
          <div className="lg:col-span-2 bg-white border border-slate-200 p-8 h-[300px]">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-6 border-b border-slate-100 pb-2">
              Monthly Acquisition Velocity
            </h3>
            <div className="h-full flex items-center justify-center font-mono text-xs text-slate-400 border border-dashed border-slate-200 bg-slate-50">
              [AreaChart Component]
            </div>
          </div>
        </div>

        {/* Gauge & Actions Row */}
        <div className="grid md:grid-cols-3 gap-8">
          <NetZeroGauge pct={80} current={12450} goal={15500} unit="tCO₂e" />

          <div className="bg-white border border-slate-200 p-8 flex flex-col justify-center text-center">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-4">
              Scope 3 Liability
            </h3>
            <p className="font-sans text-4xl text-slate-900 mb-2">
              1,200 <span className="text-xl text-slate-400">tCO₂e</span>
            </p>
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
              Remaining gap to target
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <Link
              href="/marketplace"
              className="flex-1 bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold uppercase tracking-widest hover:bg-brand-900 transition-colors"
            >
              Explore Spot Market
            </Link>
            <button
              type="button"
              className="flex-1 bg-white border border-slate-200 text-slate-900 flex items-center justify-center text-[10px] font-bold uppercase tracking-widest hover:border-slate-900 transition-colors"
            >
              Generate ESRS Compliance PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
