"use client";

import { CheckCircle2, Circle, Clock, Leaf } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useProjectDeveloperDashboard } from "@/hooks/use-dashboard";
import { DashboardState, formatNumber, SectionLabel, StatCard } from "./Shared";

export default function ProjectDeveloperDashboard({
  userName,
}: {
  userName: string;
  role?: string;
}) {
  const { data, isLoading, isError, error, refetch } =
    useProjectDeveloperDashboard();

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  );

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

  // No project-developer profile linked yet
  if (!data.developer) {
    return (
      <div className="p-8 space-y-8 font-sans">
        <div className="bg-foreground p-12 text-background">
          <h1 className="font-sans font-extrabold text-5xl tracking-tighter mb-6">
            WELCOME,{" "}
            <span className="text-brand">{userName.toUpperCase()}</span>
          </h1>
          <p className="text-background/70 max-w-xl">
            You don't have a project developer profile yet. Complete onboarding
            to register your first project.
          </p>
          <Link
            href="/projects/new"
            className="inline-flex mt-6 bg-brand text-foreground px-6 py-3 text-[10px] font-bold uppercase tracking-widest"
          >
            Start Onboarding
          </Link>
        </div>
      </div>
    );
  }

  const { projects, assessments, credits, activities } = data;
  const activeProjectId = selectedProjectId ?? projects[0]?.id ?? null;
  const activeProject = projects.find((p: any) => p.id === activeProjectId);

  const projectAssessments = assessments.filter(
    (a: any) => a.projectId === activeProjectId,
  );
  const projectCredits = credits.find(
    (c: any) => c.projectId === activeProjectId,
  );
  const projectActivities = activities.filter(
    (a: any) => a.projectId === activeProjectId,
  );

  const completedModules = projectAssessments.filter(
    (a: any) => a.status === "completed",
  ).length;
  const totalModules = projectAssessments.length;

  return (
    <div className="p-8 space-y-12 font-sans">
      {/* ── Welcome + Project Switcher ── */}
      <div className="bg-foreground p-12 text-background">
        <h1 className="font-sans font-extrabold text-5xl tracking-tighter mb-6">
          WELCOME, <span className="text-brand">{userName.toUpperCase()}</span>
        </h1>
        <Card className="rounded-none border-brand bg-background/5 inline-block min-w-[300px]">
          <CardContent className="p-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-brand">
              Project Switcher
            </p>
            {projects.length === 0 ? (
              <p className="text-sm text-background/60 mt-2">
                No projects registered yet.
              </p>
            ) : (
              <select
                value={activeProjectId ?? ""}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full bg-transparent border-b-2 border-brand py-2 text-lg font-bold text-background focus:outline-none"
              >
                {projects.map((p: any) => (
                  <option
                    key={p.id}
                    value={p.id}
                    className="bg-foreground text-background"
                  >
                    {p.name?.toUpperCase()}
                  </option>
                ))}
              </select>
            )}
          </CardContent>
        </Card>
      </div>

      {projects.length > 0 && activeProject && (
        <>
          {/* ── Project Status KPIs ── */}
          <div>
            <SectionLabel label="Project Status" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-slate-200 border border-border">
              <StatCard
                label="Project Status"
                value={activeProject.projectStatus?.replace(/_/g, " ") ?? "—"}
                unit=""
                icon={Circle}
                trend={activeProject.code}
              />
              <StatCard
                label="Assessment Completion"
                value={
                  activeProject.assessmentCompletion?.replace(/_/g, " ") ?? "—"
                }
                unit=""
                icon={CheckCircle2}
                trend={`${completedModules}/${totalModules || 0} modules`}
              />
              <StatCard
                label="Methodology"
                value={
                  activeProject.assignedMethodologyStatus?.replace(/_/g, " ") ??
                  "—"
                }
                unit=""
                icon={Leaf}
                trend="Assignment status"
              />
              <StatCard
                label="Credits Issued"
                value={formatNumber(projectCredits?.totalIssued)}
                unit="tCO₂e"
                icon={Leaf}
                trend={`${formatNumber(projectCredits?.totalAvailable)} available`}
              />
            </div>
          </div>

          {/* ── Assessment Progress ── */}
          <div>
            <SectionLabel label="Assessment Progress" />
            <div className="bg-white border border-border overflow-x-auto">
              <table className="w-full text-left min-w-[600px]">
                <thead className="bg-muted border-b-2 border-slate-900">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground">
                      Module
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground">
                      Status
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground">
                      Updated
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {projectAssessments.length === 0 && (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-6 py-8 text-center text-[10px] font-mono uppercase tracking-widest text-muted-foreground"
                      >
                        No assessment modules started
                      </td>
                    </tr>
                  )}
                  {projectAssessments.map((a: any) => (
                    <tr
                      key={a.moduleKey}
                      className="hover:bg-muted transition-colors"
                    >
                      <td className="px-6 py-4 font-sans text-sm font-bold text-foreground">
                        {a.moduleKey?.replace(/_/g, " ")}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 text-[9px] font-bold uppercase tracking-widest border ${
                            a.status === "completed"
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-amber-200 bg-amber-50 text-amber-700"
                          }`}
                        >
                          {a.status?.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-[10px] text-muted-foreground uppercase">
                        {a.updatedAt
                          ? new Date(a.updatedAt).toLocaleDateString()
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Credit Issuance ── */}
          <div>
            <SectionLabel label="Credit Issuance" />
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white border border-border p-8">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-2">
                  Total Issued
                </p>
                <h4 className="text-3xl font-mono font-bold text-foreground">
                  {formatNumber(projectCredits?.totalIssued)}{" "}
                  <span className="text-sm text-muted-foreground font-sans">
                    tCO₂e
                  </span>
                </h4>
              </div>
              <div className="bg-white border border-border p-8">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-2">
                  Available
                </p>
                <h4 className="text-3xl font-mono font-bold text-foreground">
                  {formatNumber(projectCredits?.totalAvailable)}{" "}
                  <span className="text-sm text-muted-foreground font-sans">
                    tCO₂e
                  </span>
                </h4>
              </div>
              <div className="bg-white border border-border p-8">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-2">
                  Retired
                </p>
                <h4 className="text-3xl font-mono font-bold text-foreground">
                  {formatNumber(projectCredits?.totalRetired)}{" "}
                  <span className="text-sm text-muted-foreground font-sans">
                    tCO₂e
                  </span>
                </h4>
              </div>
            </div>
          </div>

          {/* ── Recent Activities ── */}
          <div>
            <SectionLabel label="Recent Activities" />
            <div className="bg-white border border-border p-6">
              {projectActivities.length === 0 ? (
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground text-center py-8">
                  No recent activity logged for this project
                </p>
              ) : (
                <ul className="space-y-4">
                  {projectActivities.map((a: any, idx: number) => (
                    <li
                      key={`${a.name}-${idx}`}
                      className={`flex items-start gap-4 ${idx < projectActivities.length - 1 ? "pb-4 border-b border-border" : ""}`}
                    >
                      <div className="p-2 bg-slate-100 text-slate-700 shrink-0">
                        <Clock size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">
                          {a.name}
                        </p>
                        <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mt-1">
                          {a.activityStatus} ·{" "}
                          {a.activityDate
                            ? new Date(a.activityDate).toLocaleDateString()
                            : "—"}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
