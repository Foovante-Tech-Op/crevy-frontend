"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Activity,
  Database,
  Leaf,
  Plus,
  ScanSearch,
  TreePine,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { type Column, DataTable } from "@/components/DataTable";
import { authClient } from "@/lib/auth";
import { ProjectService } from "@/lib/services/project-service";
import type { TRole } from "@/types/user.types";
import { SectionLabel, StatCard } from "./Shared";

// ─── Status & Stage Dictionaries ──────────────────────────────────────────────

const statusStyle: Record<string, string> = {
  draft: "border-slate-200 bg-slate-50 text-slate-500",
  active: "border-brand-200 bg-brand-50 text-brand-700",
  suspended: "border-rose-200 bg-rose-50 text-rose-700",
  closed: "border-slate-300 bg-slate-100 text-slate-600",
};

const stageStyle: Record<string, string> = {
  registration: "border-amber-200 bg-amber-50 text-amber-700",
  active: "border-blue-200 bg-blue-50 text-blue-700",
  verification: "border-purple-200 bg-purple-50 text-purple-700",
  completed: "border-brand-200 bg-brand-50 text-brand-700",
};

const stagePct: Record<string, number> = {
  registration: 20,
  active: 55,
  verification: 80,
  completed: 100,
};

export default function ProjectOwnerDashboard({
  userName,
  role,
}: {
  userName: string;
  role: TRole;
}) {
  const { data: session } = authClient.useSession();
  const userId = (session?.user as any)?.id;
  const router = useRouter();

  // ─── Data Fetching ───
  const { data: projectsRes, isLoading: loadingProjects } = useQuery({
    queryKey: ["my-projects", userId],
    queryFn: () => ProjectService.getProjects({ createdBy: userId, limit: 10 }),
    enabled: !!userId,
  });

  const projects: any[] = projectsRes?.data ?? [];
  const activeProjects = projects.filter(
    (p) => p.projectStatus === "active",
  ).length;
  const verificationProjects = projects.filter(
    (p) => p.projectStage === "verification",
  ).length;
  const totalArea = projects
    .reduce((acc: number, p: any) => acc + Number(p.totalAreaHectares ?? 0), 0)
    .toFixed(1);

  const projectColumns = useMemo<Column<any>[]>(
    () => [
      {
        header: "Asset Designation",
        render: (p) => (
          <div>
            <span className="font-sans font-bold text-slate-900 group-hover:text-brand-700 transition-colors block">
              {p.name ?? p.code}
            </span>
            <span className="font-mono text-[10px] text-slate-400 uppercase tracking-widest mt-1 block">
              {p.region}, {p.country}
            </span>
          </div>
        ),
      },
      {
        header: "Methodology",
        render: (p) => (
          <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">
            {(p.projectType as string)?.replace(/_/g, " ")}
          </span>
        ),
      },
      {
        header: "Status",
        render: (p) => (
          <span
            className={`px-2 py-1 text-[9px] font-bold uppercase tracking-widest border ${statusStyle[p.projectStatus] || statusStyle.draft}`}
          >
            {p.projectStatus}
          </span>
        ),
      },
      {
        header: "MRV Stage",
        render: (p) => (
          <span
            className={`px-2 py-1 text-[9px] font-bold uppercase tracking-widest border ${stageStyle[p.projectStage] || stageStyle.registration}`}
          >
            {p.projectStage}
          </span>
        ),
      },
      {
        header: "Telemetry Progress",
        align: "right",
        render: (p) => (
          <div className="flex items-center justify-end gap-3">
            <div className="w-24 h-1 bg-slate-200">
              <div
                className="h-full bg-slate-900 transition-all"
                style={{
                  width: `${stagePct[p.projectStage] ?? 0}%`,
                }}
              />
            </div>
            <span className="font-mono text-[10px] text-slate-500">
              {stagePct[p.projectStage] ?? 0}%
            </span>
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <div className="max-w-[1400px] mx-auto py-12 px-6 lg:px-10 font-sans selection:bg-slate-900 selection:text-white bg-slate-50 min-h-screen">
      {/* ── 1. Developer Dossier (Hero) ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid md:grid-cols-12 gap-px bg-slate-200 border border-slate-200 mb-12"
      >
        <div className="md:col-span-8 bg-white p-10 md:p-14">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-700 mb-4">
            Developer Terminal · Asset Portfolio
          </p>
          <h1 className="text-4xl md:text-5xl font-sans text-slate-900 tracking-tight leading-none mb-6">
            Environmental Asset{" "}
            <span className="italic text-slate-500">Command.</span>
          </h1>
          <p className="text-slate-500 font-light leading-relaxed max-w-xl mb-10">
            Register new environmental assets, monitor real-time dMRV telemetry,
            and track your cryptographic yield generation.
          </p>
          <Link
            href="/new-project"
            className="inline-flex items-center gap-3 bg-slate-900 text-white px-8 py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-brand-900 transition-colors"
          >
            <Plus size={14} /> Originate New Asset
          </Link>
        </div>

        <div className="md:col-span-4 bg-slate-950 p-10 md:p-14 text-white flex flex-col justify-center relative overflow-hidden">
          <div className="relative z-10">
            <p className="font-sans text-2xl mb-8">
              Developer: {userName.split(" ")[0]}
            </p>
            <ul className="space-y-4 font-mono text-xs text-slate-400">
              <li className="flex items-center gap-3">
                <span className="text-brand-500">→</span> {activeProjects}{" "}
                Assets active on ledger
              </li>
              <li className="flex items-center gap-3">
                <span className="text-brand-500">→</span> {verificationProjects}{" "}
                Assets awaiting audit
              </li>
              <li className="flex items-center gap-3 mt-6 pt-6 border-t border-slate-800 text-slate-500">
                <span className="w-2 h-2 bg-brand-500 rounded-none shrink-0 animate-pulse" />{" "}
                Developer ID:{" "}
                {userId?.substring(0, 8).toUpperCase() || "PENDING"}
              </li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* ── 2. KPI Metrics ── */}
      <div className="mb-16">
        <SectionLabel label="Portfolio Telemetry" delay={0.1} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-slate-200 border border-slate-200">
          <StatCard
            label="Registered Assets"
            value={loadingProjects ? "—" : projects.length.toString()}
            unit="Nodes"
            icon={Leaf}
            trend={
              activeProjects > 0
                ? `${activeProjects} Active / Generating`
                : "Awaiting activation"
            }
            delay={0.15}
          />
          <StatCard
            label="Spatial Scale"
            value={loadingProjects ? "—" : totalArea}
            unit="Hectares"
            icon={TreePine}
            trend="Under management"
            delay={0.2}
          />
          <StatCard
            label="Verified Yield"
            value="—"
            unit="tCO₂e"
            icon={Database}
            trend="Awaiting initial MRV cycle"
            delay={0.25}
          />
          <StatCard
            label="Pending Audits"
            value={loadingProjects ? "—" : verificationProjects.toString()}
            unit="Items"
            icon={ScanSearch}
            trend="Requires verifier action"
            delay={0.3}
          />
        </div>
      </div>

      {/* ── 3. Asset Analytics ── */}
      <div className="mb-16">
        <SectionLabel label="Financial & Yield Trajectory" delay={0.35} />
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white border border-slate-200 p-8 h-[350px] flex flex-col">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-6 border-b border-slate-100 pb-2">
              Settlement Revenue
            </h3>
            <div className="flex-1 flex items-center justify-center bg-slate-50 text-slate-400 font-mono text-xs border border-dashed border-slate-200">
              [AreaChart: Revenue projections pending issuance]
            </div>
          </div>
          <div className="bg-white border border-slate-200 p-8 h-[350px] flex flex-col">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-6 border-b border-slate-100 pb-2">
              Sequestration Efficiency
            </h3>
            <div className="flex-1 flex items-center justify-center bg-slate-50 text-slate-400 font-mono text-xs border border-dashed border-slate-200">
              [GroupedBarChart: Awaiting MRV baseline]
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. Asset Ledger (Table) ── */}
      <div className="mb-16">
        <SectionLabel
          label="Asset Ledger"
          delay={0.4}
          action={{ label: "Originate Asset", href: "/new-project" }}
        />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
        >
          {!loadingProjects && projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 px-6 text-center bg-slate-50 border border-slate-200">
              <div className="p-4 bg-white border border-slate-200 text-slate-400 mb-4">
                <Database size={24} />
              </div>
              <p className="font-sans font-bold text-slate-900 text-xl mb-2">
                Ledger Empty
              </p>
              <p className="text-slate-500 font-light text-sm max-w-sm mb-6">
                You have not originated any assets on the Crevy network.
                Register your first asset to begin tracking yield.
              </p>
              <Link
                href="/new-project"
                className="bg-slate-900 text-white px-6 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-brand-700 transition-colors"
              >
                Originate Protocol
              </Link>
            </div>
          ) : (
            <DataTable
              columns={projectColumns}
              data={projects}
              isLoading={loadingProjects}
              loadingMessage="Syncing Ledger..."
              emptyMessage="Ledger empty."
              getRowKey={(p: any) => p.id}
              onRowClick={(p: any) => router.push(`/projects/${p.id}`)}
              currentPage={1}
              totalPages={1}
              onPageChange={() => {}}
            />
          )}
        </motion.div>
      </div>

      {/* ── 5. Activity Feed ── */}
      <div className="pb-12">
        <SectionLabel label="System Ledger Feed" delay={0.5} />
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="bg-white border border-slate-200 p-6"
        >
          <ul className="space-y-4">
            <li className="flex items-start gap-4 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
              <div className="p-2 bg-slate-100 text-slate-700 shrink-0">
                <Activity size={16} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">
                  Developer profile activated successfully.
                </p>
                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-1">
                  System ✦ Awaiting first asset
                </p>
              </div>
            </li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
