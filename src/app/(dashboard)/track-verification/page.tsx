"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  Cpu,
  FileText,
  Hexagon,
  Loader2,
  Network,
  Radio,
} from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { authClient } from "@/lib/auth";
import { ProjectService } from "@/lib/services/project-service";
import { cn } from "@/lib/utils";

// ─── Pipeline Configuration ───────────────────────────────────────────────────

const PIPELINE = [
  {
    key: "submission",
    label: "Submission",
    desc: "Initial documentation & project intake.",
    icon: FileText,
  },
  {
    key: "review",
    label: "Methodology Review",
    desc: "Evaluating project methodology & design.",
    icon: Activity,
  },
  {
    key: "audit",
    label: "Audit",
    desc: "Rigorous third-party verification.",
    icon: Cpu,
  },
  {
    key: "registry",
    label: "Registry Submission",
    desc: "Final issuance and registry anchoring.",
    icon: Network,
  },
];

const statusStyles: Record<string, string> = {
  draft: "text-slate-400 border-slate-200",
  active: "text-brand-700 border-brand-700",
  suspended: "text-red-700 border-red-700",
  closed: "text-slate-900 border-slate-900",
};

// ─── Page Component ───────────────────────────────────────────────────────────

export default function TrackVerificationPage() {
  const { data: session } = authClient.useSession();
  const userId = (session?.user as any)?.id;

  const { data, isLoading } = useQuery({
    queryKey: ["my-projects-verification", userId],
    queryFn: () => ProjectService.getProjects({ createdBy: userId, limit: 20 }),
    enabled: !!userId,
  });

  const projects: any[] = data?.data ?? [];

  // Group projects by pipeline stage using the aligned status matrix
  const grouped = useMemo(() => {
    // Rule: assessmentCompletion has to be complete to enter the pipeline
    const pipelineProjects = projects.filter(
      (p) => p.assessmentCompletion === "complete",
    );

    return PIPELINE.reduce<Record<string, any[]>>((acc, stage) => {
      acc[stage.key] = pipelineProjects.filter((p) => {
        const { registryStatus } = p;

        switch (stage.key) {
          case "submission":
            // Assuming you add 'pending_review' as the new default for registryStatus.
            // If it's still using 'admin_verified' as the default, you'll need to adjust this.
            return !registryStatus || registryStatus === "pending_review";

          case "review":
            return (
              registryStatus === "admin_verified" ||
              registryStatus === "dmrv_verified"
            );

          case "audit":
            return registryStatus === "registry_pending";

          case "registry":
            return registryStatus === "registry_certified";

          default:
            return false;
        }
      });
      return acc;
    }, {});
  }, [projects]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-slate-900 selection:text-white">
      {/* Editorial Header */}
      <div className="bg-white border-b border-slate-200 pt-16 pb-12">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="inline-flex items-center justify-center gap-3 mb-6">
            <div className="w-8 h-[1px] bg-slate-900"></div>
            <span className="text-slate-900 text-[10px] font-bold uppercase tracking-[0.2em]">
              Verification Matrix
            </span>
            <div className="w-8 h-[1px] bg-slate-900"></div>
          </div>
          <h1 className="text-4xl md:text-5xl font-sans text-slate-900 tracking-tight mb-4">
            Pipeline <span className="italic text-brand-700">Oversight.</span>
          </h1>
          <p className="text-slate-500 text-sm max-w-xl leading-relaxed">
            Monitor the cryptographic lifecycle of your environmental assets.
            Track projects from initial submission through rigorous methodology
            review and auditing, down to final registry submission.
          </p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto py-12 px-6 lg:px-10">
        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-32 text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin mb-4" />
            <span className="text-xs font-mono uppercase tracking-widest">
              Querying Ledger...
            </span>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && projects.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-center border border-slate-200 bg-white">
            <Hexagon
              className="h-12 w-12 text-slate-300 mb-6"
              strokeWidth={1}
            />
            <p className="font-sans text-2xl text-slate-900 mb-2">
              The matrix is empty.
            </p>
            <p className="text-slate-500 text-sm mb-8 max-w-sm">
              Register an environmental project and complete the initial
              assessment to initialize the data ingestion and verification
              pipeline.
            </p>
            <Link
              href="/new-project"
              className="inline-flex items-center justify-center px-8 py-3 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-brand-800 transition-colors"
            >
              Initialize Project
            </Link>
          </div>
        )}

        {/* Kanban Matrix */}
        {!isLoading && projects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 xl:gap-0 xl:divide-x divide-slate-200 border-y border-slate-200 bg-white shadow-sm">
            {PIPELINE.map((stage, index) => {
              const stageProjects = grouped[stage.key] ?? [];
              const Icon = stage.icon;

              return (
                <div key={stage.key} className="flex flex-col h-full">
                  {/* Column Header */}
                  <div className="px-6 py-6 border-b border-slate-200 bg-slate-50/50">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-mono text-slate-400">
                        [ 0{index + 1} ]
                      </span>
                      <Icon className="h-4 w-4 text-slate-400" />
                    </div>
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-1">
                      {stage.label}
                    </h2>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                      {stage.desc}
                    </p>

                    {/* Count Indicator */}
                    <div className="mt-6 flex items-center gap-2">
                      <div className="h-[1px] flex-1 bg-slate-200"></div>
                      <span className="text-[10px] font-mono text-slate-400">
                        {stageProjects.length} ASSETS
                      </span>
                      <div className="h-[1px] flex-1 bg-slate-200"></div>
                    </div>
                  </div>

                  {/* Column Cards */}
                  <div className="p-4 flex-1 space-y-4 bg-slate-50/30">
                    {stageProjects.length === 0 ? (
                      <div className="h-32 border border-dashed border-slate-200 flex items-center justify-center">
                        <p className="text-[10px] font-mono uppercase tracking-widest text-slate-300">
                          Awaiting Data
                        </p>
                      </div>
                    ) : (
                      stageProjects.map((p: any) => (
                        <Link
                          key={p.id}
                          href={`/projects/${p.id}`}
                          className="block bg-white border border-slate-200 p-5 hover:border-slate-900 hover:shadow-xl transition-all duration-300 group"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <span className="text-[10px] font-mono text-slate-400">
                              {p.code || "PRJ-PENDING"}
                            </span>
                            <span
                              className={cn(
                                "text-[9px] font-bold uppercase tracking-widest border px-1.5 py-0.5",
                                statusStyles[p.projectStatus] ??
                                  statusStyles.draft,
                              )}
                            >
                              {p.projectStatus}
                            </span>
                          </div>

                          <h3 className="font-sans text-lg text-slate-900 leading-tight mb-2 group-hover:text-brand-800 transition-colors">
                            {p.name ?? "Unnamed Initiative"}
                          </h3>

                          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-4">
                            {(p.projectType as string)?.replace(/_/g, " ")}
                            {" / "}
                            {p.region}
                          </div>

                          <div className="pt-4 border-t border-slate-100 flex items-end justify-between">
                            <div className="flex flex-col gap-1">
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                Registered Area
                              </span>
                              <span className="text-sm font-mono text-slate-900">
                                {p.totalAreaHectares
                                  ? Number(p.totalAreaHectares).toFixed(1)
                                  : "0.0"}{" "}
                                ha
                              </span>
                            </div>

                            {/* Stage-Specific Microcopy */}
                            {stage.key === "audit" && (
                              <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-600">
                                <Radio className="h-3 w-3 animate-pulse text-brand-600" />
                                AUDIT_IN_PROGRESS
                              </div>
                            )}
                            {stage.key === "registry" && (
                              <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-600">
                                <Network className="h-3 w-3 text-brand-600" />
                                REGISTRY_PENDING
                              </div>
                            )}
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
