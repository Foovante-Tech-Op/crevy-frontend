"use client";

import { motion } from "framer-motion";
import {
  Activity,
  ArrowUpRight,
  Clock,
  DollarSign,
  Layers,
  Leaf,
  type LucideIcon,
  Mail,
  Users,
} from "lucide-react";
import Link from "next/link";
import { type Column, DataTable } from "@/components/DataTable";
import { useSuperAdminDashboard } from "@/hooks/use-dashboard";
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

// ─── Formatting helpers ─────────────────────────────────────────────────────
// Postgres serialises SUM() over numeric columns as a string, so every
// aggregate off /dashboards/super-admin arrives as a string, not a number.

const PENDING = "—";

const toNumber = (value: string | number | null | undefined) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatCount = (value: string | number | null | undefined) =>
  toNumber(value).toLocaleString("en-US", { maximumFractionDigits: 0 });

const formatCurrency = (
  value: string | number | null | undefined,
  currency = "USD",
) =>
  toNumber(value).toLocaleString("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  });

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "";
  return date
    .toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "UTC",
    })
    .concat(" UTC");
};

// The backend tags each audit-log entry with an icon name; map it to the
// component here rather than shipping icon components over the wire.
const ACTIVITY_ICONS: Record<string, LucideIcon> = {
  Leaf,
  DollarSign,
  Layers,
  Activity,
};

const ACTIVITY_ICON_STYLES: Record<string, string> = {
  Leaf: "bg-brand-50 text-brand-700",
  DollarSign: "bg-blue-50 text-blue-700",
  Layers: "bg-slate-100 text-slate-700",
  Activity: "bg-slate-100 text-slate-700",
};

function EmptyPanel({ message }: { message: string }) {
  return (
    <div className="w-full h-[250px] flex items-center justify-center bg-slate-50 text-slate-400 font-mono text-[10px] uppercase tracking-widest border border-dashed border-slate-200 text-center px-6">
      {message}
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function SuperAdminDashboard({
  userName,
}: {
  userName: string;
}) {
  // Platform-wide metrics: registry KPIs, financial vectors, MRV pipeline
  // counters and the audit-log activity feed.
  const {
    data: metrics,
    isLoading: metricsLoading,
    isError: metricsError,
  } = useSuperAdminDashboard();

  // Fetch the 10 most recent waitlist registrations for the dashboard snapshot
  const { data: waitlistResponse, isLoading: waitlistLoading } =
    useWaitlistRegistrations({ limit: 10 });

  const waitlistRows: WaitlistRow[] = waitlistResponse?.data ?? [];
  const pendingWaitlistCount = waitlistRows.filter(
    (r) => r.status === "pending",
  ).length;

  const pendingProjectsCount = metrics?.hero.pendingProjects ?? 0;
  const pendingUsersCount = metrics?.hero.pendingKyc ?? 0;
  // Waitlist applications are counted client-side because they come from a
  // separate endpoint that the metrics payload doesn't cover.
  const totalPending = (metrics?.hero.totalPending ?? 0) + pendingWaitlistCount;

  const activityFeed = metrics?.activityFeed ?? [];

  // The backend hands back /mrv/* hrefs for these stages, but this app has no
  // /mrv routes — the verification pipeline lives at /track-verification.
  const mrvStages = [
    {
      key: "ingest",
      label: "Ingest",
      count: metrics?.mrvPipeline.ingest.count ?? 0,
      href: "/track-verification",
    },
    {
      key: "verify",
      label: "Verify",
      count: metrics?.mrvPipeline.verify.count ?? 0,
      href: "/track-verification",
    },
    {
      key: "anchor",
      label: "Anchor",
      count: metrics?.mrvPipeline.anchor.count ?? 0,
      href: "/track-verification",
    },
    {
      key: "issue",
      label: "Issue",
      count: metrics?.mrvPipeline.issue.count ?? 0,
      href: "/credits-ledger",
    },
  ];

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
                <span className="text-brand-500">→</span>{" "}
                {metricsLoading ? PENDING : pendingProjectsCount} Project
                reviews pending
              </li>
              <li className="flex items-center gap-3">
                <span className="text-brand-500">→</span>{" "}
                {metricsLoading ? PENDING : pendingUsersCount} KYC audits
                pending
              </li>
              <li className="flex items-center gap-3">
                <span className="text-amber-400">→</span>{" "}
                {waitlistLoading ? PENDING : pendingWaitlistCount} waitlist
                applications unreviewed
              </li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* ── 2. Alert Strip ── */}
      {metricsError ? (
        <AlertStrip
          count={1}
          type="error"
          message="Platform metrics could not be loaded. Figures below are unavailable, not zero."
          delay={0.1}
        />
      ) : (
        <AlertStrip
          count={totalPending}
          message={`${pendingProjectsCount} asset submissions, ${pendingUsersCount} identity registrations, and ${pendingWaitlistCount} waitlist applications require governance review.`}
          delay={0.1}
        />
      )}

      {/* ── 3. KPI Matrix ── */}
      <div className="mb-16">
        <SectionLabel label="Registry Liquidity Overview" delay={0.15} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-slate-200 border border-slate-200">
          <StatCard
            label="Total Credits Issued"
            value={
              metricsLoading
                ? PENDING
                : formatCount(metrics?.kpi.totalCreditsIssued.value)
            }
            unit={metrics?.kpi.totalCreditsIssued.unit ?? "tCO₂e"}
            icon={Leaf}
            trend={metrics?.kpi.totalCreditsIssued.trend}
            delay={0.2}
          />
          <StatCard
            label="Gross Registry Value"
            value={
              metricsLoading
                ? PENDING
                : formatCurrency(metrics?.kpi.grossRegistryValue.value)
            }
            unit="USD"
            icon={DollarSign}
            trend={metrics?.kpi.grossRegistryValue.trend}
            delay={0.25}
          />
          {/* No trend on the two below: the API returns a hardcoded string for
              each ("+3 Nodes", "-2 vs last week") rather than a computed
              delta, so rendering it would be inventing a movement. */}
          <StatCard
            label="Active Projects"
            value={
              metricsLoading
                ? PENDING
                : formatCount(metrics?.kpi.activeProjects.value)
            }
            unit="Nodes"
            icon={Layers}
            delay={0.3}
          />
          <StatCard
            label="Pending Governance"
            value={metricsLoading ? PENDING : totalPending.toString()}
            unit="Actions"
            icon={Clock}
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
                ? PENDING
                : (waitlistResponse?.total ?? waitlistRows.length).toString()
            }
            unit="Registered"
            icon={Users}
            delay={0.4}
          />
          <StatCard
            label="Pending Review"
            value={waitlistLoading ? PENDING : pendingWaitlistCount.toString()}
            unit="Applications"
            icon={Mail}
            delay={0.42}
          />
          <StatCard
            label="Approved"
            value={
              waitlistLoading
                ? PENDING
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
                ? PENDING
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
                {metricsLoading
                  ? PENDING
                  : formatCurrency(
                      metrics?.financial.platformRevenueMtd.value,
                      metrics?.financial.platformRevenueMtd.currency,
                    )}
              </h4>
              <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500 flex items-center gap-1">
                <ArrowUpRight size={12} /> Platform fees, month to date
              </p>
            </div>
          </div>
          <div className="bg-white border border-slate-200 p-8 flex flex-col justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">
                Payout Queue
              </p>
              <h4 className="text-4xl font-mono font-bold text-slate-900 mb-2">
                {metricsLoading
                  ? PENDING
                  : formatCount(metrics?.financial.payoutQueue.count)}{" "}
                <span className="text-base text-slate-400 font-sans">
                  Pending
                </span>
              </h4>
              <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
                {metricsLoading
                  ? PENDING
                  : formatCurrency(
                      metrics?.financial.payoutQueue.outstandingAmount,
                      metrics?.financial.payoutQueue.currency,
                    )}{" "}
                outstanding
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
                {metricsLoading
                  ? PENDING
                  : formatCount(
                      metrics?.financial.creditsAcquiredMtd.quantity,
                    )}{" "}
                <span className="text-base text-slate-400 font-sans">
                  {metrics?.financial.creditsAcquiredMtd.unit ?? "tCO₂e"}
                </span>
              </h4>
              <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
                Value:{" "}
                {metricsLoading
                  ? PENDING
                  : formatCurrency(
                      metrics?.financial.creditsAcquiredMtd.value,
                      metrics?.financial.creditsAcquiredMtd.currency,
                    )}
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
            {/* The metrics endpoint returns point-in-time aggregates only —
                there is no time-series to plot yet. The scaffolding stays so
                the charts can drop in once the API exposes history. */}
            <div className="bg-white border border-slate-200 p-8 h-[350px]">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-6 border-b border-slate-100 pb-2">
                User Acquisition Trajectory
              </h3>
              <EmptyPanel message="No time-series data available yet" />
            </div>
            <div className="bg-white border border-slate-200 p-8 h-[350px]">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-6 border-b border-slate-100 pb-2">
                Credit Market Liquidity
              </h3>
              <EmptyPanel message="No time-series data available yet" />
            </div>
          </div>
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white border border-slate-200 p-8 h-[350px] overflow-x-hidden">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-6 border-b border-slate-100 pb-2">
                MRV Pipeline Flow
              </h3>
              <MrvPipelineStepper stages={mrvStages} />
            </div>
            <div className="bg-slate-900 border border-slate-900 p-8 h-[350px] text-white">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-6 border-b border-slate-800 pb-2">
                Governance Queues
              </h3>
              {/* Registry uptime / anchoring latency / double-count status are
                  fixed strings in the API, not measurements, so they are not
                  shown. Everything here is a live count. */}
              <ul className="space-y-5 font-mono text-xs">
                <li className="flex justify-between border-b border-slate-800 pb-2">
                  <span>Pending KYC</span>
                  <span className="text-amber-400">
                    {metricsLoading ? PENDING : `${pendingUsersCount} Items`}
                  </span>
                </li>
                <li className="flex justify-between border-b border-slate-800 pb-2">
                  <span>Project Reviews</span>
                  <span className="text-amber-400">
                    {metricsLoading ? PENDING : `${pendingProjectsCount} Items`}
                  </span>
                </li>
                <li className="flex justify-between border-b border-slate-800 pb-2">
                  <span>Waitlist Queue</span>
                  <span className="text-amber-400">
                    {waitlistLoading
                      ? PENDING
                      : `${pendingWaitlistCount} Pending`}
                  </span>
                </li>
                <li className="flex justify-between border-b border-slate-800 pb-2">
                  <span>Blockchain Anchors</span>
                  <span className="text-brand-400">
                    {metricsLoading
                      ? PENDING
                      : formatCount(metrics?.mrvPipeline.anchor.count)}
                  </span>
                </li>
                <li className="flex justify-between border-b border-slate-800 pb-2">
                  <span>MRV Ingest Queue</span>
                  <span className="text-brand-400">
                    {metricsLoading
                      ? PENDING
                      : formatCount(metrics?.mrvPipeline.ingest.count)}
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
          {metricsLoading ? (
            <p className="py-8 text-center font-mono text-[10px] uppercase tracking-widest text-slate-400">
              Fetching audit log...
            </p>
          ) : activityFeed.length === 0 ? (
            <p className="py-8 text-center font-mono text-[10px] uppercase tracking-widest text-slate-400">
              No ledger activity recorded yet.
            </p>
          ) : (
            <ul className="space-y-4">
              {activityFeed.map((entry, index) => {
                const Icon = ACTIVITY_ICONS[entry.icon] ?? Activity;
                const iconStyles =
                  ACTIVITY_ICON_STYLES[entry.icon] ??
                  ACTIVITY_ICON_STYLES.Activity;
                return (
                  <li
                    key={entry.id}
                    className={`flex items-start gap-4 ${
                      index < activityFeed.length - 1
                        ? "pb-4 border-b border-slate-100"
                        : ""
                    }`}
                  >
                    <div className={`p-2 shrink-0 ${iconStyles}`}>
                      <Icon size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {entry.message}
                      </p>
                      <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-1">
                        {formatTimestamp(entry.timestamp)}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </motion.div>
    </div>
  );
}
