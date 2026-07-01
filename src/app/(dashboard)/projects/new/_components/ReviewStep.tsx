// src/app/(dashboard)/projects/new/_components/ReviewStep.tsx
"use client";

import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ModuleStep } from "./SidebarProgress";

interface ReviewStepProps {
  onPrev: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  projectName: string;
  projectType: string;
  modules: ModuleStep[];
  score?: {
    carbonReadinessScore?: number | null;
    primaryMethodology?: string | null;
  } | null;
}

const ReviewStep = ({
  onPrev,
  onSubmit,
  isSubmitting,
  projectName,
  projectType,
  modules,
  score,
}: ReviewStepProps) => {
  const submittedCount = modules.filter((m) => m.status === "submitted").length;
  const totalCount = modules.length;

  const InfoRow = ({
    label,
    value,
  }: {
    label: string;
    value: string | number | boolean | undefined | null;
  }) => {
    if (value === undefined || value === "" || value === null) return null;
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-3 border-b border-slate-100">
        <dt className="text-sm font-medium text-slate-500">{label}</dt>
        <dd className="text-sm text-slate-900 sm:col-span-2">
          {typeof value === "boolean" ? (value ? "Yes" : "No") : value}
        </dd>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold mb-2">Review & Submit</h2>
        <p className="text-slate-400 text-sm md:text-base">
          Review your project assessment before final submission.
        </p>
      </div>

      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 md:p-6">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
          <div>
            <h3 className="font-semibold text-emerald-900 text-sm md:text-base">
              Almost there!
            </h3>
            <p className="text-emerald-700 text-xs md:text-sm mt-1">
              {submittedCount} of {totalCount} modules complete. You can submit
              now or return to complete remaining modules.
            </p>
          </div>
        </div>
      </div>

      {/* Project Overview */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-6">
        <h3 className="text-base md:text-lg font-semibold mb-4 text-slate-900">
          Project Overview
        </h3>
        <dl className="divide-y divide-slate-100">
          <InfoRow label="Project Name" value={projectName} />
          <InfoRow label="Category" value={projectType.replace(/_/g, " ")} />
          <InfoRow
            label="Assessment Completion"
            value={`${submittedCount} / ${totalCount}`}
          />
          {score?.carbonReadinessScore !== undefined &&
            score?.carbonReadinessScore !== null && (
              <InfoRow
                label="Carbon Readiness Score"
                value={`${score.carbonReadinessScore} / 100`}
              />
            )}
          {score?.primaryMethodology && (
            <InfoRow
              label="Suggested Methodology"
              value={score.primaryMethodology}
            />
          )}
        </dl>
      </div>

      {/* Module Summary */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-6">
        <h3 className="text-base md:text-lg font-semibold mb-4 text-slate-900">
          Assessment Modules
        </h3>
        <div className="space-y-3">
          {modules.map((mod) => (
            <div
              key={mod.moduleKey}
              className="flex items-center justify-between p-3 border border-slate-100 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-2 h-2 rounded-full",
                    mod.status === "submitted"
                      ? "bg-emerald-500"
                      : mod.status === "in_progress"
                        ? "bg-amber-500"
                        : "bg-slate-300",
                  )}
                />
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {mod.title}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {mod.status === "submitted"
                      ? "Submitted"
                      : mod.status === "in_progress"
                        ? "In progress"
                        : "Not started"}
                  </p>
                </div>
              </div>
              {mod.status === "submitted" && (
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 md:mt-12 flex flex-col sm:flex-row justify-end gap-3 md:gap-4">
        <Button
          type="button"
          variant="ghost"
          onClick={onPrev}
          className="px-6 md:px-8 py-3 md:py-4 text-slate-400 font-bold text-sm md:text-base order-2 sm:order-1"
        >
          Previous
        </Button>
        <Button
          type="submit"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="bg-[#2ebc8d] hover:bg-[#27a37b] px-8 py-3 md:px-12 md:py-4 xl:py-6 text-sm md:text-base xl:text-lg rounded-xl font-bold transition-all order-1 sm:order-2"
        >
          {isSubmitting ? (
            <Loader2 className="animate-spin" />
          ) : (
            "Submit Project"
          )}
        </Button>
      </div>
    </div>
  );
};

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export default ReviewStep;
