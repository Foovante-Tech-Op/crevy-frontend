"use client";

import { Building2, CreditCard, Lock, Shield, User } from "lucide-react";
import { useState } from "react";
// ─── Component Registry ──
import { useUser } from "@/hooks/use-user"; // Adjust path as needed
import { cn } from "@/lib/utils";
import { GovernanceSection } from "./_components/GovernanceSection";
import { PayoutSection } from "./_components/PayoutSection";
import { ProfileSection } from "./_components/ProfileSection";
import { SecuritySection } from "./_components/SecuritySection";

export default function SettingsPage() {
  const { user } = useUser();
  const role = user?.role || "guest";

  const [activeTab, setActiveTab] = useState("profile");

  // Role Classification Helpers
  const isCorporate = [
    "org_admin",
    "sustainability_manager",
    "org_auditor",
  ].includes(role);
  const isSuperAdmin = role === "super_admin";
  const _isStaffAdmin = [
    "project_manager",
    "mrv_admin",
    "financial_admin",
  ].includes(role);

  // Dynamic Tab Resolution
  const TABS = [
    {
      id: "profile",
      label: isCorporate ? "Corporate Entity" : "Identity Profile",
      icon: isCorporate ? Building2 : User,
    },
    { id: "security", label: "Access & Security", icon: Lock },
    ...(isSuperAdmin || role === "mrv_admin"
      ? [{ id: "governance", label: "Registry Governance", icon: Shield }]
      : []),
    ...(isSuperAdmin || role === "financial_admin" || isCorporate
      ? [
          {
            id: "financials",
            label: isCorporate ? "Billing & Settlement" : "Financial Routing",
            icon: CreditCard,
          },
        ]
      : []),
  ];

  return (
    <div className="max-w-[1400px] mx-auto py-12 px-6 lg:px-10 font-sans animate-in fade-in duration-700 pb-24">
      {/* ── Editorial Header ── */}
      <div className="border-b border-slate-200 pb-12 mb-12">
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="w-8 h-[1px] bg-slate-900"></div>
          <span className="text-slate-900 text-[10px] font-bold uppercase tracking-[0.2em]">
            System Control Center
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-sans text-slate-900 tracking-tight leading-none mb-4">
          Configuration <span className="italic text-slate-500">Matrix.</span>
        </h1>
        <p className="text-slate-500 text-sm max-w-xl leading-relaxed font-light">
          Manage your institutional identity, security protocols, and
          operational thresholds across the Crevy registry.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1">
          <span className="w-2 h-2 bg-brand-500 rounded-none"></span>
          <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-700">
            Active Clearance: {role.replace(/_/g, " ")}
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-[240px,1fr] gap-12 lg:gap-24">
        {/* ── Terminal Navigation ── */}
        <nav className="space-y-1">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-6 border-b border-slate-200 pb-3">
            Configuration Nodes
          </h3>
          {TABS.map((tab) => (
            <button
              type="button"
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-4 text-[10px] font-bold uppercase tracking-widest transition-colors border-l-2",
                activeTab === tab.id
                  ? "bg-slate-50 border-slate-900 text-slate-900"
                  : "border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50/50",
              )}
            >
              <tab.icon
                size={14}
                className={activeTab === tab.id ? "text-brand-700" : ""}
              />
              {tab.label}
            </button>
          ))}
        </nav>

        {/* ── Active Module Space ── */}
        <div className="min-h-[500px]">
          {activeTab === "profile" && (
            <ProfileSection isCorporate={isCorporate} />
          )}
          {activeTab === "security" && <SecuritySection />}
          {activeTab === "governance" && (
            <GovernanceSection isSuperAdmin={isSuperAdmin} />
          )}
          {activeTab === "financials" && (
            <PayoutSection isCorporate={isCorporate} />
          )}
        </div>
      </div>
    </div>
  );
}
