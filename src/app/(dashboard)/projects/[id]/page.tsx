"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  ArrowLeft,
  Calendar,
  Coins,
  FileQuestion,
  History,
  Lock,
  MapPin,
  Radio,
  ShieldAlert,
  Target,
  UserCheck,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
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
import { SpatialCoordinatePicker } from "@/components/SpatialCoordinatePicker";
import { useUser } from "@/hooks/use-user";
import { getErrorMessage } from "@/lib/errors";
import { ProjectService } from "@/lib/services/project-service";
import { cn } from "@/lib/utils";

// ─── Administrative Oversight Visual System ──────────────────────────────────

function ProjectDetailContent() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;
  const { user, isPending } = useUser();
  const [isMounted, setIsMounted] = useState(false);
  const [activeAssessmentTab, setActiveAssessmentTab] = useState<string>("");
  const [classificationOpen, setClassificationOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 1. RBAC Guard: Strictly Administrative
  const isAuthorized =
    user?.role === "super_admin" ||
    user?.role === "admin" ||
    user?.role === "mrv_admin" ||
    user?.role === "project_manager" ||
    user?.role === "project_owner";

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

  const queryClient = useQueryClient();
  const project = projectRes?.data;
  const verifications = verifRes?.data ?? [];
  const developer = project?.developer;
  const auditLogs = project?.auditLogs ?? [];
  const assessments = project?.onboardingAssessments ?? [];
  const assessmentScore = project?.assessmentScore;

  console.log("Data: ", project, verifRes);

  // Set default active tab when assessments load
  useEffect(() => {
    if (assessments.length > 0 && !activeAssessmentTab) {
      setActiveAssessmentTab(assessments[0].moduleKey);
    }
  }, [assessments, activeAssessmentTab]);

  // Redirect if not authorized
  useEffect(() => {
    if (!isPending && !isAuthorized && isMounted) {
      router.push("/dashboard");
      toast.error("You don't have access to this project", {
        description: "Contact an administrator if you think this is a mistake.",
      });
    }
  }, [isAuthorized, isPending, router, isMounted]);

  // Hooks must run unconditionally on every render, so this is declared
  // before the early returns below (loading / not-found) rather than after
  // them — otherwise the hook count differs between renders and React
  // throws "Rendered more hooks than during the previous render".
  const updateClassificationMutation = useMutation({
    mutationFn: (
      data: Parameters<typeof ProjectService.updateClassification>[1],
    ) => ProjectService.updateClassification(project?.id, data),
    onSuccess: () => {
      toast.success("Classification updated");
      queryClient.invalidateQueries({ queryKey: ["admin-project-detail", id] });
      setClassificationOpen(false);
    },
    onError: (error: any) => {
      toast.error("Couldn't update classification", {
        description: getErrorMessage(error, "Please try again."),
      });
    },
  });

  // The project query is `enabled: !!id && !!user`, so while `user` is still
  // resolving (isPending) the query hasn't started yet and `loadingProject`
  // is `false` — not because data loaded, but because react-query never
  // fired the fetch. Without `isPending` here, that gap renders the
  // "Asset Not Found" branch below for a flash before the real fetch even
  // begins.
  if (loadingProject || !isMounted || isPending) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-900 rounded-none animate-spin mb-4" />
        <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
          Decrypting Ledger...
        </span>
      </div>
    );
  }

  if (!loadingProject && !project) {
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

  // Parse Coordinates from Centroid
  const centroid = project.site?.centroid;
  const mapLng = Array.isArray(centroid) ? centroid[0]?.toString() : "";
  const mapLat = Array.isArray(centroid) ? centroid[1]?.toString() : "";

  // Map verifications to chart data
  const chartData = verifications.map((v: any) => ({
    date: new Date(v.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    yield: v.carbonYield || 0,
    confidence: v.confidenceScore || 0,
  }));

  // Helper to format dates
  const isClassificationAdmin =
    user?.role === "super_admin" ||
    user?.role === "admin" ||
    user?.role === "project_manager";

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "TBD";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

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

      {/* ── 1. CORE ASSET TELEMETRY (full width) ────────────────────── */}
      <section className="w-full border-b-2 border-slate-900 bg-white">
        <div className="max-w-[1400px] mx-auto p-8 md:p-14 lg:p-20">
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Asset Ref:{" "}
                <span className="text-slate-900 font-mono">
                  {project.code || id}
                </span>
              </p>
              {project.registryStatus === "admin_verified" && (
                <span className="bg-slate-900 text-white text-[9px] font-mono px-2 py-0.5 uppercase tracking-widest">
                  Verified
                </span>
              )}
            </div>
            <h1 className="font-sans text-4xl md:text-5xl lg:text-6xl text-slate-900 tracking-tight leading-none mb-6">
              {project.name}
            </h1>
            <p className="text-slate-500 font-light leading-relaxed max-w-lg whitespace-pre-wrap mb-6">
              {project.description ||
                "No thesis description provided by the developer."}
            </p>

            {/* SDGs Section */}
            {project.sdgs && project.sdgs.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <Target size={14} className="text-slate-400 mr-2" />
                {project.sdgs.map((sdg: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-brand-50/50 text-brand-700 border border-brand-200 text-[9px] font-mono uppercase tracking-widest"
                  >
                    {sdg}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Expanded Matrix */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-slate-200 border border-slate-200">
            <div className="bg-white p-6 flex flex-col">
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                Methodology
              </span>
              <span className="font-mono text-sm text-slate-900 capitalize break-words">
                {project.projectType?.replace(/_/g, " ") || "UNKNOWN"}
              </span>
            </div>
            <div className="bg-white p-6 flex flex-col">
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                Industry Sector
              </span>
              <span className="font-mono text-sm text-slate-900 capitalize break-words">
                {project.industrySector?.replace(/_/g, " ") || "UNKNOWN"}
              </span>
            </div>
            <div className="bg-white p-6 flex flex-col">
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                Sector
              </span>
              <span className="font-mono text-sm text-slate-900 capitalize break-words">
                {project.sector?.replace(/_/g, " ") || "UNKNOWN"}
              </span>
            </div>
            <div className="bg-white p-6 flex flex-col">
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                Activity
              </span>
              <span className="font-mono text-sm text-slate-900 capitalize break-words">
                {project.activity ||
                  project.sector?.replace(/_/g, " ") ||
                  "UNKNOWN"}
              </span>
            </div>
            <div className="bg-white p-6 flex flex-col">
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                Product
              </span>
              <span className="font-mono text-sm text-slate-900 capitalize break-words">
                {project.product || "UNKNOWN"}
              </span>
            </div>
            <div className="bg-white p-6 flex flex-col">
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                Carbon Mechanism
              </span>
              <span className="font-mono text-sm text-slate-900 capitalize break-words">
                {project.carbonMechanism || "UNKNOWN"}
              </span>
            </div>
            <div className="bg-white p-6 flex flex-col">
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                Credit Type
              </span>
              <span className="font-mono text-sm text-slate-900 capitalize break-words">
                {project.creditType?.replace(/_/g, " ") || "UNKNOWN"}
              </span>
            </div>
            <div className="bg-white p-6 flex flex-col">
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                Jurisdiction
              </span>
              <span className="font-mono text-sm text-slate-900">
                {project.country || "N/A"} - {project.region || "N/A"}
              </span>
            </div>
            <div className="bg-white p-6 flex flex-col">
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                Site Type
              </span>
              <span className="font-mono text-sm text-slate-900 capitalize break-words">
                {project.site?.siteType?.replace(/_/g, " ") || "N/A"}
              </span>
            </div>
            <div className="bg-white p-6 flex flex-col">
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-1.5">
                <Coins size={10} /> Base Currency
              </span>
              <span className="font-mono text-sm text-slate-900">
                {project.currencyCode || "N/A"}
              </span>
            </div>
            <div className="bg-white p-6 flex flex-col">
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-1.5">
                <Calendar size={10} /> Timeline
              </span>
              <span className="font-mono text-xs text-slate-900 flex flex-col gap-0.5">
                <span>S: {formatDate(project.startDate)}</span>
                <span className="text-slate-400">
                  E: {formatDate(project.endDate)}
                </span>
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
            <div className="bg-white p-6 flex flex-col">
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                Classification Status
              </span>
              <span
                className={cn(
                  "font-mono text-xs font-bold uppercase",
                  project.assignedMethodologyStatus === "admin_confirmed"
                    ? "text-brand-600"
                    : project.assignedMethodologyStatus === "auto_suggested"
                      ? "text-amber-600"
                      : "text-slate-500",
                )}
              >
                {project.assignedMethodologyStatus?.replace(/_/g, " ") ||
                  "NOT ASSIGNED"}
              </span>
            </div>
          </div>

          {isClassificationAdmin && (
            <div className="mt-8 flex items-center gap-4">
              <button
                type="button"
                onClick={() => setClassificationOpen(true)}
                className="px-5 py-3 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-slate-700 transition-colors"
              >
                Edit Classification
              </button>
              {project.classificationConfirmedAt && (
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                  Confirmed {formatDate(project.classificationConfirmedAt)}
                </span>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── 1.5 SPATIAL OVERVIEW / GIS MAP (full width) ──────────────────── */}
      <section className="w-full border-b-2 border-slate-900 bg-slate-950 relative">
        <SpatialCoordinatePicker
          latitude={mapLat}
          longitude={mapLng}
          onChange={(coords) => console.log("Spatial focus adjusted:", coords)}
          className="w-full h-[75vh] min-h-[600px] border-0"
        />
      </section>

      {/* ── 2. ONBOARDING & ASSESSMENT DOSSIER ───────────────────────────────── */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-10 py-16 border-b border-slate-200">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900 border-b-2 border-slate-900 pb-3 mb-8">
          Intake & Verification Responses
        </h2>

        {assessments.length > 0 ? (
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Sidebar Navigation */}
            <div className="w-full md:w-1/4 flex flex-col gap-2 shrink-0">
              {assessments.map((a: any) => (
                <button
                  type="button"
                  key={a.moduleKey}
                  onClick={() => setActiveAssessmentTab(a.moduleKey)}
                  className={cn(
                    "text-left px-5 py-4 border transition-all duration-300 group",
                    activeAssessmentTab === a.moduleKey
                      ? "bg-slate-900 border-slate-900 text-white shadow-md"
                      : "bg-white border-slate-200 text-slate-500 hover:border-slate-400",
                  )}
                >
                  <span className="block text-[10px] font-mono uppercase tracking-widest mb-1">
                    {a.moduleKey.replace(/_/g, " ")}
                  </span>
                  <span
                    className={cn(
                      "text-[9px] font-bold uppercase tracking-wider",
                      activeAssessmentTab === a.moduleKey
                        ? "text-brand-400"
                        : a.status === "submitted"
                          ? "text-brand-600"
                          : "text-amber-600",
                    )}
                  >
                    STATUS: {a.status.replace(/_/g, " ")}
                  </span>
                </button>
              ))}
            </div>

            {/* Active Content Area */}
            <div className="w-full md:w-3/4 bg-white border border-slate-200 p-8 min-h-[400px]">
              {(() => {
                const active = assessments.find(
                  (a: any) => a.moduleKey === activeAssessmentTab,
                );

                if (
                  !active ||
                  !active.answers ||
                  Object.keys(active.answers).length === 0
                ) {
                  return (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 py-20">
                      <FileQuestion size={32} className="mb-4 opacity-50" />
                      <p className="font-mono text-xs uppercase tracking-widest">
                        Awaiting data submission.
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-8">
                    <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
                      <span className="font-sans text-xl text-slate-900 capitalize">
                        {active.moduleKey.replace(/_/g, " ")}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                        v{active.schemaVersion || 1}.0
                      </span>
                    </div>

                    {Object.entries(active.answers).map(
                      ([questionId, answer]) => (
                        <div key={questionId} className="group">
                          <p className="text-sm font-bold text-slate-900 mb-3 capitalize leading-snug">
                            {questionId.replace(/_/g, " ")}
                          </p>
                          <div className="font-mono text-xs text-slate-700 bg-slate-50 p-4 border border-slate-100 whitespace-pre-wrap leading-relaxed">
                            {typeof answer === "object"
                              ? JSON.stringify(answer, null, 2)
                              : String(answer || "—")}
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200 h-[250px] flex flex-col items-center justify-center text-slate-400">
            <FileQuestion
              size={32}
              className="mb-4 opacity-50 text-slate-300"
            />
            <p className="font-mono text-[10px] uppercase tracking-widest">
              No structural intake modules found.
            </p>
          </div>
        )}
      </section>

      {/* ── 2.5 ASSESSMENT SCORES & METHODOLOGY ──────────────────────────────── */}
      {assessmentScore && (
        <section className="max-w-[1400px] mx-auto px-6 lg:px-10 py-16 border-b border-slate-200">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900 border-b-2 border-slate-900 pb-3 mb-8">
            Assessment Scores & Methodology
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {/* Carbon Readiness Score */}
            <div className="bg-white border border-slate-200 p-6">
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">
                Carbon Readiness
              </span>
              <div className="flex items-end gap-2">
                <span className="font-mono text-3xl text-slate-900">
                  {assessmentScore.carbonReadinessScore ?? "—"}
                </span>
                <span className="text-xs text-slate-400 mb-1">/100</span>
              </div>
              <div className="mt-3 h-1 bg-slate-100">
                <div
                  className="h-full bg-brand-600"
                  style={{
                    width: `${assessmentScore.carbonReadinessScore ?? 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Data Quality Score */}
            <div className="bg-white border border-slate-200 p-6">
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">
                Data Quality
              </span>
              <div className="flex items-end gap-2">
                <span className="font-mono text-3xl text-slate-900">
                  {assessmentScore.dataQualityScore ?? "—"}
                </span>
                <span className="text-xs text-slate-400 mb-1">/100</span>
              </div>
              <div className="mt-3 h-1 bg-slate-100">
                <div
                  className="h-full bg-brand-600"
                  style={{
                    width: `${assessmentScore.dataQualityScore ?? 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Additionality Score */}
            <div className="bg-white border border-slate-200 p-6">
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">
                Additionality
              </span>
              <div className="flex items-end gap-2">
                <span className="font-mono text-3xl text-slate-900">
                  {assessmentScore.additionalityScore ?? "—"}
                </span>
                <span className="text-xs text-slate-400 mb-1">/100</span>
              </div>
              <div className="mt-3 h-1 bg-slate-100">
                <div
                  className="h-full bg-brand-600"
                  style={{
                    width: `${assessmentScore.additionalityScore ?? 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Monitoring Capability Score */}
            <div className="bg-white border border-slate-200 p-6">
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">
                Monitoring Capability
              </span>
              <div className="flex items-end gap-2">
                <span className="font-mono text-3xl text-slate-900">
                  {assessmentScore.monitoringCapabilityScore ?? "—"}
                </span>
                <span className="text-xs text-slate-400 mb-1">/100</span>
              </div>
              <div className="mt-3 h-1 bg-slate-100">
                <div
                  className="h-full bg-brand-600"
                  style={{
                    width: `${assessmentScore.monitoringCapabilityScore ?? 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Documentation Score */}
            <div className="bg-white border border-slate-200 p-6">
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">
                Documentation
              </span>
              <div className="flex items-end gap-2">
                <span className="font-mono text-3xl text-slate-900">
                  {assessmentScore.documentationScore ?? "—"}
                </span>
                <span className="text-xs text-slate-400 mb-1">/100</span>
              </div>
              <div className="mt-3 h-1 bg-slate-100">
                <div
                  className="h-full bg-brand-600"
                  style={{
                    width: `${assessmentScore.documentationScore ?? 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Verification Readiness Score */}
            <div className="bg-white border border-slate-200 p-6">
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">
                Verification Readiness
              </span>
              <div className="flex items-end gap-2">
                <span className="font-mono text-3xl text-slate-900">
                  {assessmentScore.verificationReadinessScore ?? "—"}
                </span>
                <span className="text-xs text-slate-400 mb-1">/100</span>
              </div>
              <div className="mt-3 h-1 bg-slate-100">
                <div
                  className="h-full bg-brand-600"
                  style={{
                    width: `${assessmentScore.verificationReadinessScore ?? 0}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Methodology Recommendations */}
          {(assessmentScore.primaryMethodology ||
            assessmentScore.alternativeMethodology) && (
            <div className="bg-white border border-slate-200 p-8">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-900 mb-6">
                Methodology Recommendations
              </h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">
                    Primary Methodology
                  </span>
                  <p className="font-mono text-sm text-slate-900">
                    {assessmentScore.primaryMethodology || "Not determined"}
                  </p>
                </div>
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">
                    Alternative Methodology
                  </span>
                  <p className="font-mono text-sm text-slate-900">
                    {assessmentScore.alternativeMethodology || "Not determined"}
                  </p>
                </div>
              </div>
              {assessmentScore.futureMethodologyPathway && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">
                    Future Pathway
                  </span>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {assessmentScore.futureMethodologyPathway}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Baseline & Projected Impact */}
          {(assessmentScore.baselineWasteVolumeTonnes ||
            assessmentScore.projectedWasteDivertedTonnes) && (
            <div className="bg-white border border-slate-200 p-8 mt-6">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-900 mb-6">
                Baseline & Projected Impact
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {assessmentScore.baselineWasteVolumeTonnes && (
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">
                      Baseline Waste Volume
                    </span>
                    <p className="font-mono text-sm text-slate-900">
                      {assessmentScore.baselineWasteVolumeTonnes} tonnes/year
                    </p>
                  </div>
                )}
                {assessmentScore.baselineDisposalPathway && (
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">
                      Baseline Disposal Pathway
                    </span>
                    <p className="font-mono text-sm text-slate-900 capitalize">
                      {assessmentScore.baselineDisposalPathway.replace(
                        /_/g,
                        " ",
                      )}
                    </p>
                  </div>
                )}
                {assessmentScore.baselineMethanePotentialTco2e && (
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">
                      Baseline Methane Potential
                    </span>
                    <p className="font-mono text-sm text-slate-900">
                      {assessmentScore.baselineMethanePotentialTco2e} tCO₂e
                    </p>
                  </div>
                )}
                {assessmentScore.projectedWasteDivertedTonnes && (
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">
                      Projected Waste Diverted
                    </span>
                    <p className="font-mono text-sm text-slate-900">
                      {assessmentScore.projectedWasteDivertedTonnes} tonnes/year
                    </p>
                  </div>
                )}
                {assessmentScore.projectedMethaneAvoidedTco2e && (
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">
                      Projected Methane Avoided
                    </span>
                    <p className="font-mono text-sm text-slate-900">
                      {assessmentScore.projectedMethaneAvoidedTco2e} tCO₂e
                    </p>
                  </div>
                )}
                {assessmentScore.projectedCo2eReductionTco2e && (
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">
                      Projected CO₂e Reduction
                    </span>
                    <p className="font-mono text-sm text-slate-900">
                      {assessmentScore.projectedCo2eReductionTco2e} tCO₂e
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Calculation Metadata */}
          <div className="mt-6 text-[10px] font-mono text-slate-400 uppercase tracking-widest">
            Calculated: {formatDate(assessmentScore.calculatedAt)} • Engine v
            {assessmentScore.scoringEngineVersion}
          </div>
        </section>
      )}

      {/* ── 3. IDENTITY & KYC DOSSIER ────────────────────────────────────────── */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-10 py-16 border-b border-slate-200">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900 border-b-2 border-slate-900 pb-3 mb-8">
          Developer Identity Profile
        </h2>

        {developer ? (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white border border-slate-200 p-8 flex flex-col">
              <UserCheck size={24} className="text-slate-400 mb-4" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                Entity Name
              </span>
              <span className="font-sans text-2xl text-slate-900">
                {developer.name || "UNREGISTERED"}
              </span>
            </div>
            <div className="bg-white border border-slate-200 p-8 flex flex-col">
              <Lock size={24} className="text-slate-400 mb-4" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                Developer Code
              </span>
              <span className="font-mono text-lg font-bold text-slate-900">
                {developer.code || "PENDING"}
              </span>
            </div>
            <div className="bg-white border border-slate-200 p-8 flex flex-col">
              <Activity size={24} className="text-slate-400 mb-4" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                System Identifier
              </span>
              <span className="font-mono text-sm text-slate-900 break-all">
                {developer.id}
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

      {/* ── 4. MRV TELEMETRY & YIELD ─────────────────────────────────────────── */}
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

      {/* ── 5. CRYPTOGRAPHIC AUDIT LEDGER ─────────────────────────────────────── */}
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
