"use client";

import {
  CheckCircle2,
  ClipboardList,
  FileText,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuditorDashboard } from "@/hooks/use-dashboard";
import {
  DashboardState,
  formatNumber,
  SectionLabel,
  StatCard,
} from "../Shared";

export default function AuditorDashboard() {
  const { data, isLoading, isError, error, refetch } = useAuditorDashboard();

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
    auditQueue,
    scoresAwaitingVerification,
    myAuditHistory,
    documentsPendingReview,
  } = data;

  return (
    <div className="p-8 space-y-12 font-sans">
      <h1 className="text-4xl font-extrabold uppercase tracking-tighter text-foreground">
        Auditor <span className="text-brand">Portal</span>
      </h1>

      {/* ── KPI Strip ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-slate-200 border border-border">
        <StatCard
          label="Audit Queue"
          value={formatNumber(auditQueue.length)}
          icon={ClipboardList}
          trend="Awaiting methodology audit"
        />
        <StatCard
          label="Scores to Verify"
          value={formatNumber(scoresAwaitingVerification.length)}
          icon={ShieldCheck}
          trend="Readiness scores"
        />
        <StatCard
          label="Docs Pending Review"
          value={formatNumber(documentsPendingReview.length)}
          icon={FileText}
          trend="Unverified uploads"
        />
        <StatCard
          label="My Audit History"
          value={formatNumber(myAuditHistory.length)}
          icon={CheckCircle2}
          trend="Recent actions logged"
        />
      </div>

      {/* ── Audit Queue ── */}
      <div>
        <SectionLabel
          label="Audit Queue"
          action={{ label: "View All Projects", href: "/projects" }}
        />
        <Card className="rounded-none border-foreground">
          <CardHeader>
            <CardTitle className="font-mono text-xs uppercase tracking-widest">
              Projects Awaiting Methodology Audit
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-left">
              <thead className="border-b-2 border-slate-900 bg-muted">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground">
                    Project
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground">
                    Type / Sector
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground">
                    Assessment
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditQueue.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-8 text-center text-[10px] font-mono uppercase tracking-widest text-muted-foreground"
                    >
                      No projects in the audit queue
                    </td>
                  </tr>
                )}
                {auditQueue.map((p: any) => (
                  <tr key={p.id} className="hover:bg-muted transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-sm text-foreground">
                      {p.code} — {p.name}
                    </td>
                    <td className="px-6 py-4 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                      {p.projectType} / {p.sector}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-[9px] font-bold uppercase tracking-widest border border-amber-200 bg-amber-50 text-amber-700">
                        {p.assessmentCompletion?.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
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
          </CardContent>
        </Card>
      </div>

      {/* ── Scores Awaiting Verification ── */}
      <div>
        <SectionLabel label="Assessment Scores Awaiting Verification" />
        <Card className="rounded-none border-foreground">
          <CardContent className="p-0">
            <table className="w-full text-left">
              <thead className="border-b-2 border-slate-900 bg-muted">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground">
                    Project ID
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground">
                    Readiness Score
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground">
                    Methodology
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground">
                    Calculated
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {scoresAwaitingVerification.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-8 text-center text-[10px] font-mono uppercase tracking-widest text-muted-foreground"
                    >
                      No scores awaiting verification
                    </td>
                  </tr>
                )}
                {scoresAwaitingVerification.map((s: any, idx: number) => (
                  <tr
                    key={`${s.projectId}-${idx}`}
                    className="hover:bg-muted transition-colors"
                  >
                    <td className="px-6 py-4 font-mono text-sm text-foreground">
                      {String(s.projectId).slice(0, 8)}
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-sm text-foreground">
                      {s.carbonReadinessScore ?? "—"}
                    </td>
                    <td className="px-6 py-4 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                      {s.primaryMethodology ?? "—"}
                    </td>
                    <td className="px-6 py-4 font-mono text-[10px] text-muted-foreground uppercase">
                      {s.calculatedAt
                        ? new Date(s.calculatedAt).toLocaleDateString()
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* ── Documents Pending Review ── */}
        <div>
          <SectionLabel label="Documents Pending Review" />
          <Card className="rounded-none border-foreground">
            <CardContent className="p-6">
              {documentsPendingReview.length === 0 ? (
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground text-center py-8">
                  No documents pending review
                </p>
              ) : (
                <ul className="space-y-4">
                  {documentsPendingReview.map((d: any, idx: number) => (
                    <li
                      key={d.id}
                      className={`flex items-start gap-4 ${idx < documentsPendingReview.length - 1 ? "pb-4 border-b border-border" : ""}`}
                    >
                      <div className="p-2 bg-slate-100 text-slate-700 shrink-0">
                        <FileText size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">
                          {d.fileName}
                        </p>
                        <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mt-1">
                          {d.documentType} ·{" "}
                          {d.uploadedAt
                            ? new Date(d.uploadedAt).toLocaleDateString()
                            : "—"}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── My Audit History ── */}
        <div>
          <SectionLabel label="My Audit History" />
          <Card className="rounded-none border-foreground">
            <CardContent className="p-6">
              {myAuditHistory.length === 0 ? (
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground text-center py-8">
                  No audit actions logged yet
                </p>
              ) : (
                <ul className="space-y-4">
                  {myAuditHistory.map((h: any, idx: number) => (
                    <li
                      key={h.id}
                      className={`flex items-start gap-4 ${idx < myAuditHistory.length - 1 ? "pb-4 border-b border-border" : ""}`}
                    >
                      <div className="p-2 bg-emerald-50 text-emerald-700 shrink-0">
                        <CheckCircle2 size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">
                          {h.action} on {h.resource}
                        </p>
                        <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mt-1">
                          {h.createdAt
                            ? new Date(h.createdAt).toLocaleString()
                            : "—"}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
