"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2,
  FileText,
  MapPin,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const onboardingSteps = [
  {
    id: 1,
    title: "KYC Verification",
    desc: "Verify Project Owner identity and legal documentation.",
    icon: UserCheck,
    status: "completed",
    date: "May 12, 2026",
  },
  {
    id: 2,
    title: "Project Registration",
    desc: "Review project coordinates, type, and estimation models.",
    icon: MapPin,
    status: "active",
    date: "In Progress",
  },
  {
    id: 3,
    title: "Technical Review",
    desc: "MRV setup and baseline sequestration calculation.",
    icon: FileText,
    status: "pending",
  },
  {
    id: 4,
    title: "Final Approval",
    desc: "Granting permission to list on the marketplace.",
    icon: ShieldCheck,
    status: "pending",
  },
];

export default function OnboardingFlow() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3
            className="text-lg font-bold text-[#131927]"
            style={{ fontFamily: "var(--font-syne)" }}
          >
            Project Lifecycle Progress
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Track the journey from registration to credit issuance.
          </p>
        </div>
        <div className="flex gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-[#178a74]">
            <CheckCircle2 className="h-2.5 w-2.5" /> 84% Efficiency
          </span>
        </div>
      </div>

      <div className="relative">
        {/* Progress Line */}
        <div className="absolute left-6 top-0 h-full w-px bg-gray-100" />

        <div className="space-y-6">
          {onboardingSteps.map((step, i) => {
            const Icon = step.icon;
            const isCompleted = step.status === "completed";
            const isActive = step.status === "active";

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i }}
                className="relative flex items-start gap-4 pl-12"
              >
                {/* Dot */}
                <div
                  className={`absolute left-4 top-1 z-10 flex h-4 w-4 -translate-x-1/2 items-center justify-center rounded-full border-2 bg-white transition-colors
                    ${isCompleted ? "border-[#2cc295] bg-[#2cc295]" : isActive ? "border-[#2cc295]" : "border-gray-200"}`}
                >
                  {isCompleted && (
                    <CheckCircle2 className="h-2.5 w-2.5 text-white" />
                  )}
                </div>

                <div
                  className={`flex-1 rounded-xl border p-4 transition-all ${isActive ? "border-[#2cc295]/30 bg-[#2cc295]/5 shadow-sm" : "border-gray-50 bg-gray-50/30"}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-lg ${isCompleted || isActive ? "bg-[#2cc295]/10 text-[#178a74]" : "bg-gray-100 text-gray-400"}`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <h4
                          className={`text-sm font-bold ${isActive ? "text-[#131927]" : "text-gray-600"}`}
                        >
                          {step.title}
                        </h4>
                        <p className="text-[11px] text-gray-400 leading-tight mt-0.5">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                    {step.date && (
                      <span
                        className={`text-[10px] font-medium ${isActive ? "text-[#178a74]" : "text-gray-400"}`}
                      >
                        {step.date}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <Button
        type="button"
        className="mt-6 w-full rounded-xl bg-[#131927] py-3 text-xs font-bold text-white transition-all hover:bg-[#1e2d42] active:scale-95"
      >
        View Detailed Audit Log
      </Button>
    </div>
  );
}
