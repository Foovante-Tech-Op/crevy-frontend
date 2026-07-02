"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  ArrowLeft,
  History,
  Lock,
  Map as MapIcon,
  MapPin,
  Radio,
  ShieldAlert,
  UserCheck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { useUser } from "@/hooks/use-user";
import { ProjectService } from "@/lib/services/project-service";
import { cn } from "@/lib/utils";

// ─── Administrative Oversight Visual System ──────────────────────────────────

function ProjectDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const { user, isPending } = useUser();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 1. RBAC Guard: Strictly Administrative
  const isAuthorized =
    user?.role === "super_admin" ||
    user?.role === "admin" ||
    user?.role === "mrv_admin" ||
    user?.role === "project_manager";

  const { data: projectRes, isLoading: loadingProject } = useQuery({
    queryKey: ["admin-project-detail", id],
    queryFn: () => ProjectService.getProject(id as string),
    enabled: !!id && !!user,
  });

  const { data: verifRes } = useQuery({
    queryKey: ["project-telemetry", id],
    queryFn: () => ProjectService.getProjectVerifications(id as string),
    enabled: !!id,
  });

  const project = projectRes?.data;
  const verifications = verifRes?.data ?? [];
  const owner = project?.owner;
  const auditLogs = project?.auditLogs ?? [];

  // Redirect if not authorized
  useEffect(() => {
    if (!isPending && !isAuthorized && isMounted) {
      router.push("/dashboard");
      toast.error("Access Restricted", {
        description:
          "You do not have administrative clearance for this dossier.",
      });
    }
  }, [isAuthorized, isPending, router, isMounted]);

  if (loadingProject || !isMounted) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-900 rounded-none animate-spin mb-4" />
        <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
          Decrypting Ledger...
        </span>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-center px-6">
        <ShieldAlert size={32} className="text-slate-900 mb-4" />
        <h1 className="font-sans text-3xl text-slate-900 mb-2">
          Asset Not Found
        </h1>
        <p className="font-mono text-xs text-slate-500 uppercase tracking-widest mb-6">
          Error: Null Pointer in Ledger
        </p>
        <Link
          href="/dashboard"
          className="px-6 py-3 border border-slate-900 text-[10px] font-bold uppercase tracking-widest text-slate-900 hover:bg-slate-900 hover:text-white transition-colors"
        >
          Return to Console
        </Link>
      </div>
    );
  }

  // Map verifications to chart data
  const chartData = verifications.map((v: any) => ({
    date: new Date(v.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    yield: v.carbonYield || 0,
    confidence: v.confidenceScore || 0,
  }));

  return (
    <div className="bg-slate-50 min-h-screen font-sans selection:bg-slate-950 selection:text-white pb-32">
      {/* ── Top Navigation Bar ── */}
      <div className="bg-white border-b border-slate-200 px-6 lg:px-10 py-4 flex items-center justify-between sticky top-0 z-50">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Directory
        </Link>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-brand-600">
            <span className="w-1.5 h-1.5 bg-brand-500 rounded-none animate-pulse" />{" "}
            Live Telemetry
          </span>
        </div>
      </div>

      {/* ── 1. MEDIA & GIS CONTROL CENTER (Split Screen) ────────────────────── */}
      <section className="min-h-[60vh] w-full grid grid-cols-1 lg:grid-cols-2 border-b-2 border-slate-900 bg-white">
        {/* Left: Spatial Overview / Image */}
        <div className="relative border-r border-slate-200 bg-slate-950 flex items-center justify-center overflow-hidden min-h-[40vh]">
          {project.coverImageUrl ? (
            <Image
              src={project.coverImageUrl}
              alt={project.name}
              className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-luminosity"
            />
          ) : (
            <div className="flex flex-col items-center gap-4 text-slate-700">
              <MapIcon size={32} />
              <span className="font-mono text-[10px] uppercase tracking-[0.2em]">
                Spatial Data Pending
              </span>
            </div>
          )}
          <div className="absolute bottom-6 left-6 flex gap-2">
            <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700 px-3 py-1.5 text-white font-mono text-[10px] uppercase tracking-widest flex items-center gap-2">
              <MapPin size={12} className="text-brand-500" />{" "}
              {project.gpsCoordinates || "N/A"}
            </div>
          </div>
        </div>

        {/* Right: Core Asset Telemetry */}
        <div className="p-8 md:p-14 lg:p-20 flex flex-col justify-center">
          <div className="mb-12">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-4">
              Asset Ref:{" "}
              <span className="text-slate-900 font-mono">
                {project.code || id}
              </span>
            </p>
            <h1 className="font-sans text-4xl md:text-5xl lg:text-6xl text-slate-900 tracking-tight leading-none mb-6">
              {project.name}
            </h1>
            <p className="text-slate-500 font-light leading-relaxed max-w-lg">
              {project.description ||
                "No thesis description provided by the developer."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-px bg-slate-200 border border-slate-200">
            <div className="bg-white p-6 flex flex-col">
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                Methodology
              </span>
              <span className="font-mono text-sm text-slate-900">
                {project.projectType?.replace(/_/g, " ") || "UNKNOWN"}
              </span>
            </div>
            <div className="bg-white p-6 flex flex-col">
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                Jurisdiction
              </span>
              <span className="font-mono text-sm text-slate-900">
                {project.country || "N/A"} - {project.region}
              </span>
            </div>
            <div className="bg-white p-6 flex flex-col">
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                Spatial Scale
              </span>
              <span className="font-mono text-sm text-slate-900">
                {project.totalAreaHectares
                  ? `${project.totalAreaHectares} ha`
                  : "N/A"}
              </span>
            </div>
            <div className="bg-white p-6 flex flex-col">
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                Status Protocol
              </span>
              <span
                className={cn(
                  "font-mono text-sm font-bold",
                  project.projectStatus === "active"
                    ? "text-brand-600"
                    : "text-amber-600",
                )}
              >
                {project.projectStatus?.toUpperCase() || "DRAFT"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. IDENTITY & KYC DOSSIER ────────────────────────────────────────── */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-10 py-16 border-b border-slate-200">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900 border-b-2 border-slate-900 pb-3 mb-8">
          Developer Identity Profile
        </h2>

        {owner ? (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white border border-slate-200 p-8 flex flex-col">
              <UserCheck size={24} className="text-slate-400 mb-4" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                Entity Name
              </span>
              <span className="font-sans text-2xl text-slate-900">
                {owner.name || "UNREGISTERED"}
              </span>
            </div>
            <div className="bg-white border border-slate-200 p-8 flex flex-col">
              <Lock size={24} className="text-slate-400 mb-4" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                KYC / AML Status
              </span>
              <span
                className={cn(
                  "font-mono text-lg font-bold",
                  owner.verificationStatus === "verified"
                    ? "text-brand-600"
                    : "text-amber-600",
                )}
              >
                {owner.verificationStatus?.toUpperCase() || "PENDING"}
              </span>
            </div>
            <div className="bg-white border border-slate-200 p-8 flex flex-col">
              <Activity size={24} className="text-slate-400 mb-4" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                System Identifier
              </span>
              <span className="font-mono text-sm text-slate-900 break-all">
                {owner.id}
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 p-6 flex items-center gap-4">
            <ShieldAlert className="text-amber-600" size={20} />
            <span className="font-mono text-xs uppercase tracking-widest text-amber-900">
              Warning: Asset Developer Data Corrupted or Missing
            </span>
          </div>
        )}
      </section>

      {/* ── 3. MRV TELEMETRY & YIELD ─────────────────────────────────────────── */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-10 py-16 border-b border-slate-200">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900 border-b-2 border-slate-900 pb-3 mb-8">
          dMRV Yield Telemetry
        </h2>

        {chartData.length > 0 ? (
          <div className="bg-white border border-slate-200 p-8 h-[450px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorYield" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 10,
                    fill: "#64748b",
                    fontFamily: "monospace",
                  }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 10,
                    fill: "#64748b",
                    fontFamily: "monospace",
                  }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 0,
                    border: "1px solid #0f172a",
                    boxShadow: "none",
                  }}
                  itemStyle={{ fontFamily: "monospace", fontSize: "12px" }}
                  labelStyle={{
                    fontFamily: "monospace",
                    fontSize: "10px",
                    color: "#64748b",
                    marginBottom: "4px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="yield"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorYield)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="bg-slate-100 border border-slate-200 h-[300px] flex flex-col items-center justify-center text-slate-400">
            <Radio size={32} className="mb-4 opacity-50" />
            <p className="font-mono text-xs uppercase tracking-widest">
              No sensor telemetry anchored yet.
            </p>
          </div>
        )}
      </section>

      {/* ── 4. CRYPTOGRAPHIC AUDIT LEDGER ─────────────────────────────────────── */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-10 py-16">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900 border-b-2 border-slate-900 pb-3 mb-8">
          System Audit Ledger
        </h2>

        {auditLogs.length > 0 ? (
          <div className="bg-white border border-slate-200">
            {auditLogs.map((log: any, idx: number) => (
              <div
                key={log.id || idx}
                className="flex flex-col md:flex-row md:items-center justify-between p-6 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <History size={16} className="text-slate-400 mt-1" />
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      {log.action}
                    </p>
                    <p className="text-xs text-slate-500 font-light mt-1 max-w-xl">
                      {log.details}
                    </p>
                  </div>
                </div>
                <div className="mt-4 md:mt-0 font-mono text-[10px] text-slate-400 uppercase tracking-widest text-right shrink-0">
                  {new Date(log.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 p-8 text-center">
            <p className="font-mono text-xs text-slate-400 uppercase tracking-widest">
              No audit events recorded.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

// ─── DEFAULT EXPORT & SUSPENSE BOUNDARY ────────────────────────────────────
export default function ProjectDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
          <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-900 rounded-none animate-spin mb-4" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
            Initializing Secure Environment...
          </span>
        </div>
      }
    >
      <ProjectDetailContent />
    </Suspense>
  );
}
