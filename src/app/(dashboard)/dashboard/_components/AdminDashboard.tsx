"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Banknote,
  ExternalLink,
  Layers,
  Leaf,
  Radio,
  ShieldCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { type Column, DataTable } from "@/components/DataTable";
import {
  type ProjectOwnerRecord,
  ProjectOwnerService,
} from "@/lib/services/project-owner-service";
import { cn } from "@/lib/utils";
import { SectionLabel, StatCard } from "./Shared";

const kycConfig: Record<string, { label: string; className: string }> = {
  pending: {
    label: "Pending",
    className: "bg-amber-50 border-amber-200 text-amber-700",
  },
  verified: {
    label: "Verified",
    className: "bg-brand/10 border-brand/30 text-brand-700",
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-50 border-red-200 text-red-700",
  },
};

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

  // ── Real data: developers assigned to this admin (backend scopes by role) ──
  const { data: developersRes, isLoading: loadingDevelopers } = useQuery({
    queryKey: ["admin-dashboard-project-developers"],
    queryFn: () => ProjectOwnerService.listProjectOwners({ limit: 10 }),
    enabled: isProjectManager,
    staleTime: 30_000,
  });

  const developers: ProjectOwnerRecord[] = developersRes?.data ?? [];
  const totalDevelopers = developersRes?.total ?? 0;
  const pendingKycCount = developers.filter(
    (d) => d.verificationStatus === "pending",
  ).length;

  const developerColumns = useMemo<Column<ProjectOwnerRecord>[]>(
    () => [
      {
        header: "Entity",
        render: (d) => (
          <span className="font-sans text-sm font-bold text-slate-900">
            {d.name}
          </span>
        ),
      },
      {
        header: "Registry Code",
        render: (d) => (
          <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">
            {d.code}
          </span>
        ),
      },
      {
        header: "KYC Status",
        render: (d) => {
          const kc = kycConfig[d.verificationStatus] ?? kycConfig.pending;
          return (
            <span
              className={cn(
                "px-2 py-1 text-[9px] font-bold uppercase tracking-widest border",
                kc.className,
              )}
            >
              {kc.label}
            </span>
          );
        },
      },
      {
        header: "Actions",
        align: "right",
        render: (d) => (
          <Link
            href={`/project-developers/${d.code}`}
            className="text-[10px] font-bold uppercase tracking-widest text-brand-700 hover:text-slate-900 border-b border-transparent hover:border-slate-900 transition-all inline-flex items-center gap-1"
          >
            View <ExternalLink size={12} />
          </Link>
        ),
      },
    ],
    [],
  );

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
          <span className="w-2 h-2 bg-brand animate-pulse"></span>
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
              <SectionLabel
                label="Project Vetting Overview"
                action={{
                  label: "View Full Roster",
                  href: "/project-developers",
                }}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-slate-200 border border-slate-200">
                <StatCard
                  label="Assigned Developers"
                  value={loadingDevelopers ? "—" : totalDevelopers.toString()}
                  icon={Users}
                  trend="Active Entities"
                />
                <StatCard
                  label="Under Review"
                  value={loadingDevelopers ? "—" : pendingKycCount.toString()}
                  icon={Layers}
                  trend="Requires Action"
                />
                <StatCard
                  label="Site Visits"
                  value="—"
                  icon={ShieldCheck}
                  trend="Not yet integrated"
                />
                <StatCard
                  label="Pending KYC"
                  value={loadingDevelopers ? "—" : pendingKycCount.toString()}
                  icon={AlertTriangle}
                  trend="Identities unchecked"
                />
              </div>
            </div>

            {/* Assigned Developers Table */}
            <div className="bg-white border border-slate-200 overflow-x-auto">
              <div className="p-6 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900">
                  Assigned Developers
                </h3>
              </div>
              <DataTable
                columns={developerColumns}
                data={developers}
                isLoading={loadingDevelopers}
                loadingMessage="Syncing developer roster..."
                emptyMessage="No developers assigned to your portfolio."
                getRowKey={(d) => d.id}
                currentPage={1}
                totalPages={1}
                onPageChange={() => {}}
              />
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
