"use client";

import { motion } from "framer-motion";
import {
  Activity,
  ArrowUpRight,
  Clock,
  DollarSign,
  Layers,
  Leaf,
  Mail,
  Users,
} from "lucide-react";
import Link from "next/link";
import { type Column, DataTable } from "@/components/DataTable";
import { useWaitlistRegistrations } from "@/hooks/use-waitlist";
import {
  AlertStrip,
  MrvPipelineStepper,
  SectionLabel,
  StatCard,
} from "./Shared";

// ─── Waitlist row type (matches backend response shape) ─────────────────────
interface WaitlistRow {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  organizationName: string;
  roleDescription: string;
  country: string;
  status: string;
  createdAt: string;
}

const STATUS_BADGE: Record<string, { label: string; classes: string }> = {
  pending: {
    label: "Pending",
    classes:
      "border border-amber-200 bg-amber-50 text-amber-700 text-[9px] font-bold uppercase tracking-widest px-2 py-1",
  },
  approved: {
    label: "Approved",
    classes:
      "border border-brand-200 bg-brand-50 text-brand-700 text-[9px] font-bold uppercase tracking-widest px-2 py-1",
  },
  rejected: {
    label: "Rejected",
    classes:
      "border border-rose-200 bg-rose-50 text-rose-700 text-[9px] font-bold uppercase tracking-widest px-2 py-1",
  },
};

const WAITLIST_COLUMNS: Column<WaitlistRow>[] = [
  {
    header: "Applicant",
    render: (row) => (
      <span className="font-semibold text-slate-900">
        {row.firstName} {row.lastName}
      </span>
    ),
  },
  {
    header: "Email",
    render: (row) => (
      <span className="font-mono text-xs text-slate-600">{row.email}</span>
    ),
  },
  {
    header: "Organization",
    render: (row) => (
      <span className="text-slate-700">{row.organizationName}</span>
    ),
  },
  {
    header: "Role",
    render: (row) => (
      <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
        {row.roleDescription}
      </span>
    ),
  },
  {
    header: "Country",
    render: (row) => <span className="text-slate-600">{row.country}</span>,
  },
  {
    header: "Status",
    render: (row) => {
      const badge = STATUS_BADGE[row.status] ?? STATUS_BADGE.pending;
      return <span className={badge.classes}>{badge.label}</span>;
    },
  },
  {
    header: "Registered",
    align: "right",
    render: (row) => (
      <span className="font-mono text-[10px] text-slate-400 tabular-nums">
        {new Date(row.createdAt).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}
      </span>
    ),
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function SuperAdminDashboard({
  userName,
}: {
  userName: string;
}) {
  // Fetch the 10 most recent waitlist registrations for the dashboard snapshot
  const { data: waitlistResponse, isLoading: waitlistLoading } =
    useWaitlistRegistrations({ limit: 10 });

  const waitlistRows: WaitlistRow[] = waitlistResponse?.data ?? [];
  const pendingWaitlistCount = waitlistRows.filter(
    (r) => r.status === "pending",
  ).length;

  // MOCK DATA – to be replaced by real API queries per KPI
  const pendingProjectsCount = 4;
  const pendingUsersCount = 12;
  const totalPending =
    pendingProjectsCount + pendingUsersCount + pendingWaitlistCount;

  return (
    <div className="max-w-[1400px] mx-auto py-12 px-6 lg:px-10 font-sans selection:bg-slate-900 selection:text-white bg-slate-50 min-h-screen">
      {/* ── 1. Hero Dossier ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid md:grid-cols-12 gap-px bg-slate-200 border border-slate-200 mb-8"
      >
        <div className="md:col-span-8 bg-white p-10 md:p-14">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-700 mb-4">
            Super Admin · Platform Registry
          </p>
          <h1 className="text-4xl md:text-5xl font-sans text-slate-900 tracking-tight leading-none mb-6">
            Carbon Registry{" "}
            <span className="italic text-slate-500">Command Centre.</span>
          </h1>
          <p className="text-slate-500 font-light leading-relaxed max-w-xl mb-10">
            Monitor credit issuance, approve registrations, and ensure the
            cryptographic integrity of the global offset pipeline.
          </p>
          <Link
            href="/compliance"
            className="inline-flex bg-slate-900 text-white px-8 py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-brand-900 transition-colors"
          >
            Audit Ledger
          </Link>
        </div>

        <div className="md:col-span-4 bg-slate-950 p-10 md:p-14 text-white flex flex-col justify-center relative overflow-hidden">
          <div className="relative z-10">
            <p className="font-sans text-2xl mb-8">Operative: {userName}</p>
            <ul className="space-y-4 font-mono text-xs text-slate-400">
              <li className="flex items-center gap-3">
                <span className="text-brand-500">→</span> {pendingProjectsCount}{" "}
                Project reviews pending
              </li>
              <li className="flex items-center gap-3">
                <span className="text-brand-500">→</span> {pendingUsersCount}{" "}
                KYC audits pending
              </li>
              <li className="flex items-center gap-3">
                <span className="text-amber-400">→</span> {pendingWaitlistCount}{" "}
                waitlist applications unreviewed
              </li>
              <li className="flex items-center gap-3 mt-6 pt-6 border-t border-slate-800 text-slate-500">
                <span className="w-2 h-2 bg-brand-500 rounded-none shrink-0 animate-pulse" />{" "}
                All services operational
              </li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* ── 2. Alert Strip ── */}
      <AlertStrip
        count={totalPending}
        message={`${pendingProjectsCount} asset submissions, ${pendingUsersCount} identity registrations, and ${pendingWaitlistCount} waitlist applications require governance review.`}
        delay={0.1}
      />

      {/* ── 3. KPI Matrix ── */}
      <div className="mb-16">
        <SectionLabel label="Registry Liquidity Overview" delay={0.15} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-slate-200 border border-slate-200">
          <StatCard
            label="Total Credits Issued"
            value="42,840"
            unit="tCO₂e"
            icon={Leaf}
            accent="emerald"
            trend="+12% WoW"
            delay={0.2}
          />
          <StatCard
            label="Gross Registry Value"
            value="$856,800"
            unit="USD"
            icon={DollarSign}
            accent="blue"
            trend="+8% WoW"
            delay={0.25}
          />
          <StatCard
            label="Active Projects"
            value="204"
            unit="Nodes"
            icon={Layers}
            accent="emerald"
            trend="+3 Nodes"
            delay={0.3}
          />
          <StatCard
            label="Pending Governance"
            value={totalPending.toString()}
            unit="Actions"
            icon={Clock}
            accent="amber"
            trend="-2 vs last week"
            delay={0.35}
          />
        </div>
      </div>

      {/* ── 4. Waitlist KPI + Mini-Table ── */}
      <div className="mb-16">
        <SectionLabel
          label="Waitlist Intelligence"
          delay={0.38}
          action={{ label: "View Full Waitlist", href: "/user-management" }}
        />

        {/* Waitlist KPI row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-slate-200 border border-slate-200 mb-6">
          <StatCard
            label="Total Applicants"
            value={
              waitlistLoading
                ? "—"
                : (waitlistResponse?.total ?? waitlistRows.length).toString()
            }
            unit="Registered"
            icon={Users}
            delay={0.4}
          />
          <StatCard
            label="Pending Review"
            value={waitlistLoading ? "—" : pendingWaitlistCount.toString()}
            unit="Applications"
            icon={Mail}
            delay={0.42}
          />
          <StatCard
            label="Approved"
            value={
              waitlistLoading
                ? "—"
                : waitlistRows
                    .filter((r) => r.status === "approved")
                    .length.toString()
            }
            unit="This batch"
            icon={Leaf}
            delay={0.44}
          />
          <StatCard
            label="Conversion Rate"
            value={
              waitlistLoading || waitlistRows.length === 0
                ? "—"
                : `${Math.round(
                    (waitlistRows.filter((r) => r.status === "approved")
                      .length /
                      waitlistRows.length) *
                      100,
                  )}%`
            }
            unit="Approved"
            icon={Activity}
            delay={0.46}
          />
        </div>

        {/* DataTable — recent 10 waitlist registrations */}
        <DataTable<WaitlistRow>
          columns={WAITLIST_COLUMNS}
          data={waitlistRows}
          isLoading={waitlistLoading}
          loadingMessage="Fetching waitlist registrations..."
          emptyMessage="No waitlist registrations found."
          currentPage={1}
          totalPages={1}
          onPageChange={() => {}}
        />
      </div>

      {/* ── 5. Financial Overview ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mb-16"
      >
        <SectionLabel label="Financial Settlement Vectors" />
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 p-8 flex flex-col justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">
                Platform Revenue (MTD)
              </p>
              <h4 className="text-4xl font-mono font-bold text-slate-900 mb-2">
                $24,600
              </h4>
              <p className="text-[10px] font-mono uppercase tracking-widest text-brand-600 flex items-center gap-1">
                <ArrowUpRight size={12} /> 18% vs last month
              </p>
            </div>
          </div>
          <div className="bg-white border border-slate-200 p-8 flex flex-col justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">
                Payout Queue
              </p>
              <h4 className="text-4xl font-mono font-bold text-slate-900 mb-2">
                12{" "}
                <span className="text-base text-slate-400 font-sans">
                  Pending
                </span>
              </h4>
              <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
                $38,240 outstanding
              </p>
            </div>
            <Link
              href="/financials/payouts"
              className="text-[10px] font-bold uppercase tracking-widest text-slate-900 border-b border-slate-900 self-start mt-6 hover:text-brand-700 hover:border-brand-700 transition-colors"
            >
              Manage Payouts
            </Link>
          </div>
          <div className="bg-white border border-slate-200 p-8 flex flex-col justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">
                Credits Acquired (MTD)
              </p>
              <h4 className="text-4xl font-mono font-bold text-slate-900 mb-2">
                2,840{" "}
                <span className="text-base text-slate-400 font-sans">
                  tCO₂e
                </span>
              </h4>
              <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
                Value: $56,800
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── 6. MRV Pipeline + System ── */}
      <div className="mb-16">
        <SectionLabel label="Market Telemetry" delay={0.45} />
        <div className="grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-8">
            <div className="bg-white border border-slate-200 p-8 h-[350px]">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-6 border-b border-slate-100 pb-2">
                User Acquisition Trajectory
              </h3>
              <div className="w-full h-[250px] flex items-center justify-center bg-slate-50 text-slate-400 font-mono text-xs border border-dashed border-slate-200">
                [MultiLineChart Component Renders Here]
              </div>
            </div>
            <div className="bg-white border border-slate-200 p-8 h-[350px]">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-6 border-b border-slate-100 pb-2">
                Credit Market Liquidity
              </h3>
              <div className="w-full h-[250px] flex items-center justify-center bg-slate-50 text-slate-400 font-mono text-xs border border-dashed border-slate-200">
                [GroupedBarChart Component Renders Here]
              </div>
            </div>
          </div>
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white border border-slate-200 p-8 h-[350px] overflow-x-hidden">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-6 border-b border-slate-100 pb-2">
                MRV Pipeline Flow
              </h3>
              <MrvPipelineStepper
                stages={[
                  { key: "ingest", label: "Ingest", count: 14, href: "#" },
                  { key: "verify", label: "Verify", count: 6, href: "#" },
                  { key: "anchor", label: "Anchor", count: 3, href: "#" },
                  { key: "issue", label: "Issue", count: 28, href: "#" },
                ]}
              />
            </div>
            <div className="bg-slate-900 border border-slate-900 p-8 h-[350px] text-white">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-6 border-b border-slate-800 pb-2">
                System Diagnostics
              </h3>
              <ul className="space-y-5 font-mono text-xs">
                <li className="flex justify-between border-b border-slate-800 pb-2">
                  <span>Registry Uptime</span>
                  <span className="text-brand-400">99.97%</span>
                </li>
                <li className="flex justify-between border-b border-slate-800 pb-2">
                  <span>Polygon Anchoring</span>
                  <span className="text-brand-400">142ms avg</span>
                </li>
                <li className="flex justify-between border-b border-slate-800 pb-2">
                  <span>Double-Count DB</span>
                  <span className="text-brand-400">Clean</span>
                </li>
                <li className="flex justify-between border-b border-slate-800 pb-2">
                  <span>Pending KYC</span>
                  <span className="text-amber-400">
                    {pendingUsersCount} Items
                  </span>
                </li>
                <li className="flex justify-between border-b border-slate-800 pb-2">
                  <span>Waitlist Queue</span>
                  <span className="text-amber-400">
                    {pendingWaitlistCount} Pending
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* ── 7. Activity Feed ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <SectionLabel label="System Ledger Feed" />
        <div className="bg-white border border-slate-200 p-6">
          <ul className="space-y-4">
            <li className="flex items-start gap-4 pb-4 border-b border-slate-100">
              <div className="p-2 bg-brand-50 text-brand-700 shrink-0">
                <Leaf size={16} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">
                  1,200 tCO₂e Issued to PRJ-GH-2026-001
                </p>
                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-1">
                  Today, 14:32 UTC
                </p>
              </div>
            </li>
            <li className="flex items-start gap-4 pb-4 border-b border-slate-100">
              <div className="p-2 bg-blue-50 text-blue-700 shrink-0">
                <DollarSign size={16} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">
                  Payout $14,200 executed for EcoLogic Systems
                </p>
                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-1">
                  Today, 11:15 UTC
                </p>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <div className="p-2 bg-slate-100 text-slate-700 shrink-0">
                <Activity size={16} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">
                  System maintenance completed successfully
                </p>
                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-1">
                  Yesterday, 02:00 UTC
                </p>
              </div>
            </li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
}
