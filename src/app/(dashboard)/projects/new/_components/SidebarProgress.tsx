// src/app/(dashboard)/projects/new/_components/SidebarProgress.tsx
"use client";

import { cn } from "@/lib/utils";

export interface ModuleStep {
  moduleKey: string;
  title: string;
  description?: string;
  status: "not_started" | "in_progress" | "submitted";
}

interface SidebarProgressProps {
  currentStep: number;
  steps: ModuleStep[];
}

const statusLabel = (status: ModuleStep["status"]) => {
  switch (status) {
    case "submitted":
      return "Complete";
    case "in_progress":
      return "In Progress";
    default:
      return "Not Started";
  }
};

const _statusColor = (status: ModuleStep["status"]) => {
  switch (status) {
    case "submitted":
      return "text-emerald-600";
    case "in_progress":
      return "text-amber-600";
    default:
      return "text-slate-400";
  }
};

const SidebarProgress = ({ currentStep, steps }: SidebarProgressProps) => {
  return (
    <div className="flex flex-col gap-0 border-l-2 border-slate-100">
      {steps.map((step, index) => {
        const isCompleted = step.status === "submitted";
        const isActive = index === currentStep;

        return (
          <div
            key={step.moduleKey}
            className={cn(
              "relative pl-6 py-4 transition-all duration-300",
              isActive ? "border-l-2 border-foreground -ml-[2px]" : "",
            )}
          >
            <div className="flex flex-col gap-1">
              <span
                className={cn(
                  "font-mono text-[10px] uppercase tracking-widest",
                  isActive
                    ? "text-foreground font-bold"
                    : isCompleted
                      ? "text-emerald-600"
                      : "text-slate-400",
                )}
              >
                {isCompleted && "✓ "}
                {statusLabel(step.status)}
              </span>
              <span
                className={cn(
                  "text-sm tracking-wide",
                  isActive
                    ? "text-foreground font-bold font-serif"
                    : isCompleted
                      ? "text-slate-700"
                      : "text-slate-400",
                )}
              >
                {step.title}
              </span>
              {step.description && (
                <span className="text-[10px] text-slate-400 leading-relaxed max-w-[240px]">
                  {step.description}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SidebarProgress;
