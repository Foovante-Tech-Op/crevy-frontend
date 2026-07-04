"use client";

import { motion } from "framer-motion";
import {
  Activity,
  ArrowUpRight,
  Clock,
  DollarSign,
  Layers,
  Leaf,
} from "lucide-react";
import Link from "next/link";
import { useSuperAdminDashboard } from "@/hooks/use-dashboard";
import {
  AlertStrip,
  DashboardState,
  formatCurrency,
  formatNumber,
  MrvPipelineStepper,
  SectionLabel,
  StatCard,
  timeAgo,
} from "./Shared";

const ACTIVITY_ICONS: Record<string, any> = {
  Leaf,
  DollarSign,
  Layers,
  Activity,
};

export default function SuperAdminDashboard({
  userName,
}: {
  userName: string;
}) {
  const { data, isLoading, isError, error, refetch } = useSuperAdminDashboard();

  if (isLoading || isError) {
    return (
      <DashboardState
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={() => refetch()}
      />
    );
  }
  if (!data) return null;

  const {
    hero,
    kpi,
    financial,
    mrvPipeline,
    systemDiagnostics,
    vetting,
    activityFeed,
  } = data;

  return (
    <div className="max-w-[1400px] mx-auto py-12 px-6 lg:px-10 font-sans selection:bg-secondary selection:text-white bg-muted min-h-screen">
      {/* ── 1. Hero Details ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid md:grid-cols-12 gap-px bg-slate-200 border border-border mb-8"
      >
        <div className="md:col-span-8 bg-white p-10 md:p-14">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700 mb-4">
            Super Admin · Platform Registry
          </p>
          <h1 className="text-4xl md:text-5xl font-sans text-foreground tracking-tight leading-none mb-6">
            Carbon Registry{" "}
            <span className="italic text-muted-foreground">
              Command Centre.
            </span>
          </h1>
          <p className="text-muted-foreground font-light leading-relaxed max-w-xl mb-10">
            Monitor credit issuance, approve registrations, and ensure the
            cryptographic integrity of the global offset pipeline.
          </p>
          <Link
            href="/compliance"
            className="inline-flex bg-foreground text-white px-8 py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-brand transition-colors"
          >
            Audit Ledger
          </Link>
        </div>

        <div className="md:col-span-4 bg-background p-10 md:p-14 text-white flex flex-col justify-center relative overflow-hidden">
          <div className="relative z-10">
            <p className="font-sans text-2xl mb-8">Operative: {userName}</p>
            <ul className="space-y-4 font-mono text-xs text-muted-foreground">
              <li className="flex items-center gap-3">
                <span className="text-emerald-500">→</span>{" "}
                {hero.pendingProjects} Project reviews pending
              </li>
              <li className="flex items-center gap-3">
                <span className="text-emerald-500">→</span> {hero.pendingKyc}{" "}
                KYC audits pending
              </li>
              <li className="flex items-center gap-3 mt-6 pt-6 border-t border-slate-800 text-muted-foreground">
                <span className="w-2 h-2 bg-emerald-500 rounded-none shrink-0 animate-pulse" />{" "}
                All services operational
              </li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* ── 2. Alert Strip ── */}
      <AlertStrip
        count={hero.totalPending}
        message={`${hero.pendingProjects} asset submissions and ${hero.pendingKyc} identity registrations require immediate governance review.`}
        delay={0.1}
      />

      {/* ── 3. KPI Matrix ── */}
      <div className="mb-16">
        <SectionLabel label="Registry Liquidity Overview" delay={0.15} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-slate-200 border border-border">
          <StatCard
            label="Total Credits Issued"
            value={formatNumber(kpi.totalCreditsIssued.value)}
            unit={kpi.totalCreditsIssued.unit}
            icon={Leaf}
            accent="emerald"
            trend={kpi.totalCreditsIssued.trend}
            delay={0.2}
          />
          <StatCard
            label="Gross Registry Value"
            value={formatCurrency(kpi.grossRegistryValue.value)}
            unit=""
            icon={DollarSign}
            accent="blue"
            trend={kpi.grossRegistryValue.trend}
            delay={0.25}
          />
          <StatCard
            label="Active Projects"
            value={kpi.activeProjects.value}
            unit={kpi.activeProjects.unit}
            icon={Layers}
            accent="emerald"
            trend={kpi.activeProjects.trend}
            delay={0.3}
          />
          <StatCard
            label="Pending Governance"
            value={kpi.pendingGovernance.value}
            unit={kpi.pendingGovernance.unit}
            icon={Clock}
            accent="amber"
            trend={kpi.pendingGovernance.trend}
            delay={0.35}
          />
        </div>
      </div>

      {/* ── 4. Financial Overview ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mb-16"
      >
        <SectionLabel label="Financial Settlement Vectors" />
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white border border-border p-8 flex flex-col justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-2">
                Platform Revenue (MTD)
              </p>
              <h4 className="text-4xl font-mono font-bold text-foreground mb-2">
                {formatCurrency(financial.platformRevenueMtd.value)}
              </h4>
              <p className="text-[10px] font-mono uppercase tracking-widest text-emerald-600 flex items-center gap-1">
                <ArrowUpRight size={12} /> {financial.platformRevenueMtd.trend}
              </p>
            </div>
          </div>
          <div className="bg-white border border-border p-8 flex flex-col justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-2">
                Payout Queue
              </p>
              <h4 className="text-4xl font-mono font-bold text-foreground mb-2">
                {financial.payoutQueue.count}{" "}
                <span className="text-base text-muted-foreground font-sans">
                  Pending
                </span>
              </h4>
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                {formatCurrency(financial.payoutQueue.outstandingAmount)}{" "}
                outstanding
              </p>
            </div>
            <Link
              href="/financials/payouts"
              className="text-[10px] font-bold uppercase tracking-widest text-foreground border-b border-slate-900 self-start mt-6 hover:text-emerald-700 hover:border-emerald-700 transition-colors"
            >
              Manage Payouts
            </Link>
          </div>
          <div className="bg-white border border-border p-8 flex flex-col justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-2">
                Credits Acquired (MTD)
              </p>
              <h4 className="text-4xl font-mono font-bold text-foreground mb-2">
                {formatNumber(financial.creditsAcquiredMtd.quantity)}{" "}
                <span className="text-base text-muted-foreground font-sans">
                  {financial.creditsAcquiredMtd.unit}
                </span>
              </h4>
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                Value: {formatCurrency(financial.creditsAcquiredMtd.value)}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── 5. Analytics Terminal ── */}
      <div className="mb-16">
        <SectionLabel label="Market Telemetry" delay={0.45} />
        <div className="grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-8">
            <div className="bg-white border border-border p-8 h-[350px]">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-6 border-b border-border pb-2">
                User Acquisition Trajectory
              </h3>
              <div className="w-full h-[250px] flex items-center justify-center bg-muted text-muted-foreground font-mono text-xs border border-dashed border-border">
                [MultiLineChart Component Renders Here]
              </div>
            </div>
            <div className="bg-white border border-border p-8 h-[350px]">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-6 border-b border-border pb-2">
                Credit Market Liquidity
              </h3>
              <div className="w-full h-[250px] flex items-center justify-center bg-muted text-muted-foreground font-mono text-xs border border-dashed border-border">
                [GroupedBarChart Component Renders Here]
              </div>
            </div>
          </div>
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white border border-border p-8 h-[350px] overflow-x-hidden">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-6 border-b border-border pb-2">
                MRV Pipeline Flow
              </h3>
              <MrvPipelineStepper
                stages={[
                  {
                    key: "ingest",
                    label: "Ingest",
                    count: mrvPipeline.ingest.count,
                    href: mrvPipeline.ingest.href,
                  },
                  {
                    key: "verify",
                    label: "Verify",
                    count: mrvPipeline.verify.count,
                    href: mrvPipeline.verify.href,
                  },
                  {
                    key: "anchor",
                    label: "Anchor",
                    count: mrvPipeline.anchor.count,
                    href: mrvPipeline.anchor.href,
                  },
                  {
                    key: "issue",
                    label: "Issue",
                    count: mrvPipeline.issue.count,
                    href: mrvPipeline.issue.href,
                  },
                ]}
              />
            </div>
            <div className="bg-foreground border border-slate-900 p-8 h-[350px] text-white">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-6 border-b border-slate-800 pb-2">
                System Diagnostics
              </h3>
              <ul className="space-y-5 font-mono text-xs">
                <li className="flex justify-between border-b border-slate-800 pb-2">
                  <span>Registry Uptime</span>
                  <span className="text-emerald-400">
                    {systemDiagnostics.registryUptime}
                  </span>
                </li>
                <li className="flex justify-between border-b border-slate-800 pb-2">
                  <span>Polygon Anchoring</span>
                  <span className="text-emerald-400">
                    {systemDiagnostics.polygonAnchoring}
                  </span>
                </li>
                <li className="flex justify-between border-b border-slate-800 pb-2">
                  <span>Double-Count DB</span>
                  <span className="text-emerald-400">
                    {systemDiagnostics.doubleCountDb}
                  </span>
                </li>
                <li className="flex justify-between border-b border-slate-800 pb-2">
                  <span>Pending KYC</span>
                  <span className="text-amber-400">
                    {systemDiagnostics.pendingKyc} Items
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* ── 6. Data Tables ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="space-y-16"
      >
        {/* Project Vetting Queue */}
        <div>
          <SectionLabel
            label="Project Vetting Ledger"
            action={{ label: "View All Projects", href: "/projects" }}
          />
          <div className="bg-white border border-border overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
              <thead className="bg-muted border-b-2 border-slate-900">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground">
                    Project Reference
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground">
                    Originator
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground">
                    Methodology
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground">
                    Status
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vetting.projects.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-[10px] font-mono uppercase tracking-widest text-muted-foreground"
                    >
                      No projects awaiting vetting
                    </td>
                  </tr>
                )}
                {vetting.projects.map((p: any) => (
                  <tr key={p.id} className="hover:bg-muted transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-sm text-foreground">
                      {p.projectReference}
                    </td>
                    <td className="px-6 py-4 font-sans text-sm">
                      {p.originator}
                    </td>
                    <td className="px-6 py-4 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                      {p.methodology}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-[9px] font-bold uppercase tracking-widest border border-amber-200 bg-amber-50 text-amber-700">
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link
                        href={`/projects/detail?id=${p.id}`}
                        className="text-[10px] font-bold uppercase tracking-widest px-4 py-2 border border-border text-slate-600 hover:bg-secondary hover:text-white transition-colors inline-block"
                      >
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* User Vetting Queue */}
        <div>
          <SectionLabel
            label="Identity Verification Ledger"
            action={{ label: "Manage Directory", href: "/user-management" }}
          />
          <div className="bg-white border border-border overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
              <thead className="bg-muted border-b-2 border-slate-900">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground">
                    Identity Reference
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground">
                    Entity Name
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground">
                    Role Request
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground">
                    KYC Status
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vetting.identities.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-[10px] font-mono uppercase tracking-widest text-muted-foreground"
                    >
                      No identities pending verification
                    </td>
                  </tr>
                )}
                {vetting.identities.map((idn: any) => (
                  <tr key={idn.id} className="hover:bg-muted transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-sm text-foreground">
                      {idn.identityReference}
                    </td>
                    <td className="px-6 py-4 font-sans text-sm">
                      {idn.entityName}
                    </td>
                    <td className="px-6 py-4 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                      {idn.roleRequest}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-[9px] font-bold uppercase tracking-widest border border-amber-200 bg-amber-50 text-amber-700">
                        {idn.kycStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link
                        href={`/user-management?identity=${idn.id}`}
                        className="text-[10px] font-bold uppercase tracking-widest px-4 py-2 border border-border text-slate-600 hover:bg-secondary hover:text-white transition-colors inline-block"
                      >
                        Audit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity Feed */}
        <div>
          <SectionLabel label="System Ledger Feed" />
          <div className="bg-white border border-border p-6">
            {activityFeed.length === 0 ? (
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground text-center py-8">
                No recent activity
              </p>
            ) : (
              <ul className="space-y-4">
                {activityFeed.map((item: any, idx: number) => {
                  const Icon = ACTIVITY_ICONS[item.icon] ?? Activity;
                  return (
                    <li
                      key={item.id}
                      className={`flex items-start gap-4 ${idx < activityFeed.length - 1 ? "pb-4 border-b border-border" : ""}`}
                    >
                      <div className="p-2 bg-emerald-50 text-emerald-700 shrink-0">
                        <Icon size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">
                          {item.message}
                        </p>
                        <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mt-1">
                          {timeAgo(item.timestamp)}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
