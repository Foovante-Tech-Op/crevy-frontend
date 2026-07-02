"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  Banknote,
  Layers,
  Leaf,
  Radio,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { SectionLabel, StatCard } from "./Shared";

export default function AdminDashboard({
  userName,
  role,
}: {
  userName: string;
  role: string;
}) {
  const isProjectManager = role === "project_manager" || role === "super_admin";
  const isMrvAdmin = role === "mrv_admin" || role === "super_admin";
  const isFinancialAdmin = role === "financial_admin" || role === "super_admin";

  const tabs = [
    isProjectManager && {
      key: "projects",
      label: "Project Operations",
      icon: Layers,
    },
    isMrvAdmin && { key: "mrv", label: "MRV & Credits", icon: Radio },
    isFinancialAdmin && {
      key: "financials",
      label: "Financial Routing",
      icon: Banknote,
    },
  ].filter(Boolean) as { key: string; label: string; icon: any }[];

  const [activeTab, setActiveTab] = useState(tabs[0]?.key ?? "projects");

  return (
    <div className="max-w-[1400px] mx-auto py-12 px-6 lg:px-10 font-sans selection:bg-slate-900 selection:text-white bg-slate-50 min-h-screen">
      {/* ── 1. Hero Dossier ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white border border-slate-200 p-10 md:p-14 mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-8"
      >
        <div className="max-w-2xl">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-700 mb-4">
            Authorized Personnel · {role.replace(/_/g, " ")}
          </p>
          <h1 className="text-4xl md:text-5xl font-sans text-slate-900 tracking-tight leading-none mb-4">
            Institutional{" "}
            <span className="italic text-slate-500">Operations.</span>
          </h1>
          <p className="text-slate-500 font-light leading-relaxed">
            Manage your designated operational domain, review developers, and
            enforce registry protocols.
          </p>
        </div>
        <div className="shrink-0 flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200">
          <span className="w-2 h-2 bg-brand-500 animate-pulse"></span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-slate-900">
            Operative: {userName}
          </span>
        </div>
      </motion.div>

      {/* ── 2. Domain Tabs ── */}
      {tabs.length > 1 && (
        <div className="flex gap-8 border-b border-slate-200 mb-12 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              type="button"
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "pb-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-colors flex items-center gap-2 whitespace-nowrap",
                activeTab === tab.key
                  ? "border-b-2 border-slate-900 text-slate-900"
                  : "text-slate-400 hover:text-slate-700",
              )}
            >
              <tab.icon size={14} /> {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* ── 3. Active Domain View ── */}
      <div className="space-y-16">
        {activeTab === "projects" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-12"
          >
            <div>
              <SectionLabel label="Project Vetting Overview" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-slate-200 border border-slate-200">
                <StatCard
                  label="Assigned Developers"
                  value="14"
                  icon={Users}
                  trend="Active Entities"
                />
                <StatCard
                  label="Under Review"
                  value="8"
                  icon={Layers}
                  trend="Requires Action"
                />
                <StatCard
                  label="Site Visits"
                  value="3"
                  icon={ShieldCheck}
                  trend="Scheduled this week"
                />
                <StatCard
                  label="Pending KYC"
                  value="5"
                  icon={AlertTriangle}
                  trend="Identities unchecked"
                />
              </div>
            </div>

            {/* Table Mockup */}
            <div className="bg-white border border-slate-200 overflow-x-auto">
              <div className="p-6 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900">
                  Assigned Developers
                </h3>
              </div>
              <table className="w-full text-left min-w-[800px]">
                <thead className="border-b-2 border-slate-900 bg-white">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900">
                      Entity
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900">
                      Jurisdiction
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900">
                      KYC Status
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-sans text-sm font-bold text-slate-900">
                      Kwame Mensah
                    </td>
                    <td className="px-6 py-4 font-mono text-[10px] text-slate-500 uppercase">
                      GHANA
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-amber-50 border border-amber-200 text-amber-700 text-[9px] font-bold uppercase tracking-widest">
                        Pending
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        className="text-[10px] font-bold uppercase tracking-widest text-brand-700 hover:text-slate-900 border-b border-transparent hover:border-slate-900 transition-all"
                      >
                        Audit Dossier
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === "mrv" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-12"
          >
            <div>
              <SectionLabel label="Verification Engine Telemetry" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-slate-200 border border-slate-200">
                <StatCard
                  label="Pending Audits"
                  value="12"
                  icon={Radio}
                  trend="Requires validation"
                />
                <StatCard
                  label="Yield to Issue"
                  value="14"
                  unit="Batches"
                  icon={Leaf}
                  trend="Awaiting anchor"
                />
                <StatCard
                  label="AI Confidence (Avg)"
                  value="98.2"
                  unit="%"
                  icon={ShieldCheck}
                  trend="Highly secure"
                />
                <StatCard
                  label="Anomalous Flags"
                  value="2"
                  icon={AlertTriangle}
                  trend="Hardware alerts"
                />
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "financials" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-12"
          >
            <SectionLabel label="Settlement & Liquidity" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-slate-200 border border-slate-200">
              <StatCard
                label="Pending Payouts"
                value="8"
                icon={Banknote}
                trend="Awaiting release"
              />
              <StatCard
                label="Total Outstanding"
                value="$42,800"
                icon={Banknote}
                trend="USD Equivalent"
              />
              <StatCard
                label="Platform Revenue"
                value="$18,400"
                icon={Banknote}
                trend="Month-to-date"
              />
              <StatCard
                label="Active Frameworks"
                value="14"
                icon={Layers}
                trend="Contracts"
              />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
