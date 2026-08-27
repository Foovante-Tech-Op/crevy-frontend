"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  MapPin,
  Rocket,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth";
import { ProjectService } from "@/lib/services/project-service";
import type { TRole } from "@/types/user.types";

interface HeroSectionProps {
  role: TRole;
  userName: string;
}

const HeroSection = ({ role, userName }: HeroSectionProps) => {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const userId = (session?.user as any)?.id;

  const { data: projectsRes } = useQuery({
    queryKey: ["hero-projects", userId],
    queryFn: () => ProjectService.getProjects({ createdBy: userId, limit: 50 }),
    enabled: !!userId && role === "project_owner",
    staleTime: 60_000,
  });

  const projects: any[] = projectsRes?.data ?? [];
  const activeCount = projects.filter(
    (p) => p.projectStatus === "active",
  ).length;
  const pendingVerif = projects.filter(
    (p) => p.projectStage === "verification",
  ).length;

  // ── Config per role ───────────────────────────────────────────────────────
  // Shared by `project_developer` (what the backend assigns) and the legacy
  // `project_owner` key, so the two can never drift apart.
  const developerHero = {
    title: "Build your carbon legacy",
    desc: "Register projects, track sequestration, and earn verified carbon credits with full transparency.",
    cta: { label: "Register New Project", url: "/new-project", icon: Rocket },
    badge: {
      text:
        projects.length === 0
          ? "Get Started"
          : `${projects.length} Project${projects.length !== 1 ? "s" : ""}`,
      color: "bg-[#2cc295]/10 text-[#178a74]",
    },
    nextSteps: [
      projects.length === 0
        ? {
            icon: Rocket,
            text: "Register your first project to get started →",
          }
        : {
            icon: CheckCircle2,
            text: `${activeCount} project${activeCount !== 1 ? "s" : ""} active on the platform`,
          },
      pendingVerif > 0
        ? {
            icon: Clock,
            text: `${pendingVerif} project${pendingVerif !== 1 ? "s" : ""} under MRV verification`,
          }
        : {
            icon: Clock,
            text: "Upload required documents to move to active status",
          },
    ],
    gradFrom: "#2cc295",
    gradTo: "#178a74",
  };

  const configs: Record<TRole, any> = {
    project_developer: developerHero,
    project_owner: developerHero,
    admin: {
      title: "Platform Oversight",
      desc: "Manage platform health, approve users, and oversee the project verification lifecycle.",
      cta: {
        label: "View User Management",
        url: "/user-management",
        icon: Target,
      },
      badge: { text: "Administrator", color: "bg-purple-50 text-purple-700" },
      nextSteps: [
        { icon: Clock, text: "Review pending verification queue" },
        { icon: CheckCircle2, text: "Monitor platform transaction logs" },
      ],
      gradFrom: "#178a74",
      gradTo: "#131927",
    },
    financial_admin: {
      title: "Maximize your ESG impact",
      desc: "Invest in verified green projects, track your offset portfolio, and generate compliance-ready reports.",
      cta: {
        label: "Explore Marketplace",
        url: "/marketplace",
        icon: Sparkles,
      },
      badge: { text: "Carbon Marketplace", color: "bg-blue-50 text-blue-700" },
      nextSteps: [
        { icon: Clock, text: "Browse verified green projects by sector" },
        {
          icon: CheckCircle2,
          text: "Generate ESG compliance reports from your portfolio",
        },
      ],
      gradFrom: "#131927",
      gradTo: "#1e2d42",
    },
    super_admin: {
      title: "Platform Oversight",
      desc: "Manage platform health, approve users, and oversee the project verification lifecycle.",
      cta: {
        label: "View User Management",
        url: "/user-management",
        icon: Target,
      },
      badge: { text: "Super Admin", color: "bg-purple-50 text-purple-700" },
      nextSteps: [
        { icon: Clock, text: "Review pending verification queue" },
        { icon: CheckCircle2, text: "Monitor platform transaction logs" },
      ],
      gradFrom: "#178a74",
      gradTo: "#131927",
    },
    mrv_admin: {
      title: "MRV Verification Engine",
      desc: "Verify project data, monitor satellite imagery, and issue carbon credits with precision.",
      cta: {
        label: "Verification Queue",
        url: "/track-verification",
        icon: ShieldCheck,
      },
      badge: { text: "MRV Admin", color: "bg-amber-50 text-amber-700" },
      nextSteps: [
        { icon: Clock, text: "Audit pending project telemetry" },
        {
          icon: CheckCircle2,
          text: "Issue credits for verified sequestrations",
        },
      ],
      gradFrom: "#178a74",
      gradTo: "#131927",
    },
    project_manager: {
      title: "Regional Project Management",
      desc: "Oversee project owners, schedule field visits, and ensure regional compliance.",
      cta: { label: "Field Assignments", url: "/site-visits", icon: MapPin },
      badge: {
        text: "Project Manager",
        color: "bg-brand-50 text-brand-700",
      },
      nextSteps: [
        { icon: Clock, text: "Schedule upcoming site visits" },
        { icon: CheckCircle2, text: "Review field agent reports" },
      ],
      gradFrom: "#178a74",
      gradTo: "#131927",
    },
    project_admin: {
      title: "Project Administration",
      desc: "Oversee the full project lifecycle — registration, classification, and readiness — across every developer on the platform.",
      cta: { label: "View All Projects", url: "/projects", icon: Target },
      badge: { text: "Project Admin", color: "bg-purple-50 text-purple-700" },
      nextSteps: [
        {
          icon: Clock,
          text: "Review projects awaiting classification confirmation",
        },
        {
          icon: CheckCircle2,
          text: "Audit assessment completion across active projects",
        },
      ],
      gradFrom: "#178a74",
      gradTo: "#131927",
    },
    field_agent: {
      title: "Field Operations",
      desc: "Register projects on behalf of your assigned developers, and keep site visit records current.",
      cta: { label: "Site Visits", url: "/site-visits", icon: MapPin },
      badge: { text: "Field Agent", color: "bg-amber-50 text-amber-700" },
      nextSteps: [
        { icon: Clock, text: "Log outcomes from your latest site visit" },
        {
          icon: CheckCircle2,
          text: "Continue registration for an assigned developer",
        },
      ],
      gradFrom: "#178a74",
      gradTo: "#131927",
    },
    org_admin: {
      title: "Institutional Oversight",
      desc: "Manage your carbon portfolio, institutional members, and compliance reporting.",
      cta: {
        label: "Manage Organization",
        url: "/compliance",
        icon: ShieldCheck,
      },
      badge: { text: "Org Admin", color: "bg-teal-50 text-teal-700" },
      nextSteps: [
        { icon: Clock, text: "Invite new team members to your organization" },
        { icon: CheckCircle2, text: "Generate latest ESG compliance report" },
      ],
      gradFrom: "#0d9488",
      gradTo: "#115e59",
    },
    sustainability_manager: {
      title: "ESG Performance Dashboard",
      desc: "Monitor your carbon credit portfolio and maintain institutional impact records.",
      cta: { label: "View Portfolio", url: "/compliance", icon: TrendingUp },
      badge: {
        text: "Sustainability Manager",
        color: "bg-brand-50 text-brand-700",
      },
      nextSteps: [
        { icon: Clock, text: "Analyze emission scope breakdown" },
        { icon: CheckCircle2, text: "Generate ESG report for Q2" },
      ],
      gradFrom: "#059669",
      gradTo: "#065f46",
    },
    org_auditor: {
      title: "Compliance Audit Access",
      desc: "Review institutional records, verify blockchain anchors, and validate credit retirements.",
      cta: { label: "View Audit Ledger", url: "/compliance", icon: Search },
      badge: { text: "Auditor", color: "bg-slate-100 text-slate-700" },
      nextSteps: [
        { icon: Clock, text: "Verify recent credit retirement proofs" },
        { icon: CheckCircle2, text: "Cross-reference financial disbursements" },
      ],
      gradFrom: "#475569",
      gradTo: "#1e293b",
    },
  };

  const c = configs[role] || developerHero;
  const Cta = c.cta.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto max-w-5xl"
    >
      <div className="grid gap-4 md:grid-cols-5">
        {/* Left: main CTA card */}
        <div className="md:col-span-3 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <span
            className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${c.badge.color} mb-4`}
          >
            {c.badge.text}
          </span>
          <h2
            className="text-2xl font-bold leading-tight text-[#131927]"
            style={{ fontFamily: "var(--font-syne)" }}
          >
            {c.title}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-500 max-w-sm">
            {c.desc}
          </p>
          <button
            type="button"
            onClick={() => router.push(c.cta.url)}
            className="mt-5 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
            style={{
              background: `linear-gradient(135deg, ${c.gradFrom}, ${c.gradTo})`,
            }}
          >
            <Cta className="h-4 w-4" />
            {c.cta.label}
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Right: welcome + next steps */}
        <div
          className="md:col-span-2 relative overflow-hidden rounded-2xl p-6 text-white shadow-lg"
          style={{
            background: `linear-gradient(145deg, ${c.gradFrom}, ${c.gradTo})`,
          }}
        >
          <div className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full bg-white/8 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-10 -left-6 h-32 w-32 rounded-full bg-white/6 blur-2xl" />

          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/60">
              Welcome back
            </p>
            <h3
              className="mt-1 text-xl font-bold"
              style={{ fontFamily: "var(--font-syne)" }}
            >
              {userName.split(" ")[0] || "User"} 👋
            </h3>

            <div className="mt-4 space-y-2.5">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/60">
                Next Steps
              </p>
              {c.nextSteps.map((step: any, i: number) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex items-start gap-2.5 rounded-xl bg-white/10 px-3 py-2.5 backdrop-blur-sm"
                  >
                    <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white/70" />
                    <p className="text-xs leading-snug text-white/90">
                      {step.text}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default HeroSection;
