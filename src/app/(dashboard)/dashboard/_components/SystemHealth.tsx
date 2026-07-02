"use client";

import { motion } from "framer-motion";
import { Activity, Cpu, Database, Globe, Zap } from "lucide-react";

const metrics = [
  { label: "API Latency", value: "142ms", status: "good", icon: Zap },
  { label: "Database Load", value: "24%", status: "good", icon: Database },
  { label: "Node Health", value: "99.9%", status: "good", icon: Cpu },
  { label: "Global Traffic", value: "1.2k/m", status: "warning", icon: Globe },
];

export default function SystemHealth() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3
          className="text-lg font-bold text-[#131927]"
          style={{ fontFamily: "var(--font-syne)" }}
        >
          Platform Health
        </h3>
        <Activity className="h-5 w-5 text-[#2cc295] animate-pulse" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {metrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-xl border border-gray-50 bg-gray-50/50 p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon
                  className={`h-3.5 w-3.5 ${m.status === "good" ? "text-[#2cc295]" : "text-amber-500"}`}
                />
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  {m.label}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-[#131927]">
                  {m.value}
                </span>
                <div
                  className={`h-1.5 w-1.5 rounded-full ${m.status === "good" ? "bg-[#2cc295]" : "bg-amber-500"}`}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-6 flex items-center gap-3 rounded-xl bg-brand-50/50 p-3 border border-brand-100">
        <div className="h-2 w-2 rounded-full bg-[#2cc295]" />
        <p className="text-[11px] font-medium text-[#178a74]">
          All systems operational. No active incidents.
        </p>
      </div>
    </div>
  );
}
