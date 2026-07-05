"use client";

import { motion } from "framer-motion";
import { AlertCircle, ArrowRight, CheckCircle2, Info } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// ─── SECTION LABEL ───
export function SectionLabel({
  label,
  delay = 0,
  action,
}: {
  label: string;
  delay?: number;
  action?: { label: string; href: string };
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="flex justify-between items-end border-b-2 border-slate-900 pb-3 mb-8"
    >
      <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900 flex items-center gap-2">
        <span className="w-2 h-2 bg-brand rounded-none shrink-0" />
        {label}
      </h2>
      {action && (
        <Link
          href={action.href}
          className="text-[10px] font-bold uppercase tracking-widest text-brand-700 hover:text-slate-900 transition-colors flex items-center gap-1"
        >
          {action.label} <ArrowRight size={12} />
        </Link>
      )}
    </motion.div>
  );
}

// ─── ALERT STRIP ───
export function AlertStrip({
  count,
  message,
  type = "warning",
  delay = 0,
}: {
  count: number;
  message: string;
  type?: "warning" | "info" | "error";
  delay?: number;
}) {
  const config = {
    warning: {
      bg: "bg-amber-50",
      border: "border-amber-200",
      text: "text-amber-800",
      icon: AlertCircle,
    },
    error: {
      bg: "bg-rose-50",
      border: "border-rose-200",
      text: "text-rose-800",
      icon: Info,
    },
    info: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-800",
      icon: CheckCircle2,
    },
  };
  const theme = config[type];
  const Icon = theme.icon;

  if (count === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={cn(
        "p-4 border-l-4 font-mono text-xs flex items-center gap-4 mb-8",
        theme.bg,
        theme.border,
        theme.text,
      )}
    >
      <Icon size={16} className="shrink-0" />
      <span>
        <strong className="font-black">[{count}] SYSTEM NOTICES:</strong>{" "}
        {message}
      </span>
    </motion.div>
  );
}

// ─── STAT CARD ───
export function StatCard({
  label,
  value,
  unit,
  icon: Icon,
  trend,
  delay = 0,
}: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-white p-8 flex flex-col justify-between group hover:bg-slate-50 transition-colors border border-slate-200"
    >
      <div className="flex justify-between items-start mb-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
          {label}
        </p>
        {Icon && <Icon size={16} className="text-slate-900" />}
      </div>
      <div>
        <h4 className="text-3xl md:text-4xl font-mono font-bold text-slate-900 tracking-tight mb-1">
          {value}
          <span className="text-base text-slate-400 ml-1 font-sans font-normal">
            {unit}
          </span>
        </h4>
        {trend && (
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
            {trend}
          </p>
        )}
      </div>
    </motion.div>
  );
}

// ─── MRV PIPELINE STEPPER ───
export function MrvPipelineStepper({
  stages,
}: {
  stages: Array<{ key: string; label: string; count: number; href: string }>;
}) {
  return (
    <div className="flex items-center justify-between w-full h-full pb-4 overflow-x-auto scrollbar-hide">
      {stages.map((stage, idx) => (
        <div key={stage.key} className="flex items-center">
          <Link
            href={stage.href}
            className="flex flex-col items-center group min-w-[72px]"
          >
            <div className="w-12 h-12 border border-slate-900 flex items-center justify-center font-mono font-bold text-slate-900 bg-slate-50 group-hover:bg-slate-900 group-hover:text-white transition-colors mb-4 relative">
              {stage.count}
              {stage.count > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-brand-500 rounded-none border border-white" />
              )}
            </div>
            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 group-hover:text-slate-900 text-center">
              {stage.label}
            </span>
          </Link>
          {idx < stages.length - 1 && (
            <div className="w-6 md:w-12 h-[1px] bg-slate-200 mx-2 md:mx-4 -mt-8 shrink-0" />
          )}
        </div>
      ))}
    </div>
  );
}
