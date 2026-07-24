"use client";

import {
  Activity,
  Briefcase,
  Calculator,
  DollarSign,
  FileText,
  FolderPlus,
  Info,
  LayoutDashboard,
  Leaf,
  Loader2,
  UserPlus,
  Users,
} from "lucide-react";
import type React from "react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/use-session";

type Role =
  | "project_owner"
  | "field_agent"
  | "project_admin"
  | "super_admin"
  | "admin"
  | "org_admin"
  | "sustainability_manager"
  | "org_auditor"
  | "financial_admin"
  | "mrv_admin"
  | "project_manager";

type FeatureCard = {
  id: string;
  description: string;
  icon: React.ElementType;
  buttonText: string;
  variant: "primary" | "secondary";
  href: string;
};

// Define all possible features in the system
const SYSTEM_FEATURES: Record<string, FeatureCard> = {
  // Shared / Universal Features
  support: {
    id: "support",
    description: "Find answers to questions you might have or get in touch.",
    icon: Info,
    buttonText: "Go to support",
    variant: "secondary",
    href: "/support",
  },
  tour: {
    id: "tour",
    description: "Learn what you can do with the Crevy's Dashboard",
    icon: LayoutDashboard,
    buttonText: "Take a tour",
    variant: "secondary",
    href: "/tour",
  },
  carbon_calculator: {
    id: "carbon_calculator",
    description:
      "Calculate your carbon footprint across energy, transport, and lifestyle to understand your environmental impact.",
    icon: Calculator,
    buttonText: "Open calculator",
    variant: "secondary",
    href: "/carbon-calculator",
  },

  // Developer Features
  submit_project: {
    id: "submit_project",
    description: "Submit your green project for carbon credit certification.",
    icon: Leaf,
    buttonText: "Submit project",
    variant: "primary",
    href: "/projects/new",
  },
  projects: {
    id: "my_projects",
    description: "View and manage the projects currently in your portfolio.",
    icon: Briefcase,
    buttonText: "Projects",
    variant: "secondary",
    href: "/projects",
  },
  pipeline: {
    id: "pipeline",
    description: "Track the status and progress of projects in your pipeline.",
    icon: Activity,
    buttonText: "View pipeline",
    variant: "secondary",
    href: "/pipeline",
  },

  // Buyer / Organization Features
  esg_report: {
    id: "esg_report",
    description: "Access and download your comprehensive ESG reports.",
    icon: FileText,
    buttonText: "View ESG report",
    variant: "primary",
    href: "/reports/esg",
  },
  financials: {
    id: "financials",
    description: "Review your financial metrics and carbon credit investments.",
    icon: DollarSign,
    buttonText: "View financials",
    variant: "secondary",
    href: "/financials",
  },

  // Project Admin Features
  // register_project: {
  //   id:
  //   description: "Manually register and configure a new project in the system.",
  //   icon: FolderPlus,
  //   buttonText: "Register project",
  //   variant: "primary",
  //   href: "/admin/projects/register",
  // },
  manage_agents: {
    id: "manage_agents",
    description: "Assign, monitor, and manage your active field agents.",
    icon: Users,
    buttonText: "Manage agents",
    variant: "secondary",
    href: "/admin/agents",
  },
  manage_devs: {
    id: "manage_devs",
    description: "Onboard and manage assigned project developers.",
    icon: UserPlus,
    buttonText: "Manage developers",
    variant: "secondary",
    href: "/admin/developers",
  },
};

// Map features to specific roles (using actual backend role values)
const ROLE_FEATURE_MAP: Record<string, string[]> = {
  // Project Owners / Developers
  project_owner: [
    "submit_project",
    "projects",
    "pipeline",
    "carbon_calculator",
    "tour",
    "support",
  ],
  project_manager: [
    "submit_project",

    "manage_agents",
    "manage_devs",
    "projects",
    "pipeline",
    "carbon_calculator",
    "tour",
    "support",
  ],

  // Field Agents
  field_agent: ["carbon_calculator", "tour", "support"],

  // Project Admins
  project_admin: [
    "submit_project",

    "manage_agents",
    "manage_devs",
    "projects",
    "pipeline",
    "carbon_calculator",
    "tour",
    "support",
  ],

  // Organization roles (Buyers/Climate Asset Allocators)
  org_admin: [
    "esg_report",
    "financials",
    "carbon_calculator",
    "tour",
    "support",
  ],
  sustainability_manager: [
    "esg_report",
    "financials",
    "carbon_calculator",
    "tour",
    "support",
  ],
  org_auditor: [
    "esg_report",
    "financials",
    "carbon_calculator",
    "tour",
    "support",
  ],

  // Admin roles
  admin: [
    "manage_agents",
    "manage_devs",
    "submit_project",
    "projects",
    "pipeline",
    "carbon_calculator",
    "tour",
    "support",
  ],
  financial_admin: [
    "manage_agents",
    "manage_devs",
    "submit_project",
    "projects",
    "pipeline",
    "carbon_calculator",
    "tour",
    "support",
  ],
  mrv_admin: [
    "manage_agents",
    "manage_devs",
    "submit_project",
    "projects",
    "pipeline",
    "carbon_calculator",
    "tour",
    "support",
  ],

  // Super Admin sees everything
  super_admin: [
    "manage_agents",
    "manage_devs",
    "submit_project",
    "projects",
    "pipeline",
    "carbon_calculator",
    "tour",
    "support",
  ],
};

// Dynamic Theme Matrix based on Tier Clearance (matching AppSidebar)
const getPageStyles = (r: string) => {
  if (r === "super_admin") {
    return {
      bg: "bg-white",
      title: "text-brand",
      subtitle: "text-slate-600",
      card: "bg-foreground border-white/10",
      cardHover: "hover:bg-foreground/90",
      iconBg: "bg-white/10 text-white",
      description: "text-slate-300",
      primaryBtn: "bg-white text-foreground hover:bg-slate-200",
      secondaryBtn:
        "bg-transparent border-white/20 text-white hover:bg-white/10",
      // activeIndicator: "border-l-white",
    };
  }

  if (r === "admin" || r === "project_admin" || r === "project_manager") {
    return {
      bg: "bg-white",
      title: "text-foreground",
      subtitle: "text-foreground",
      card: "bg-brand/90 border-white/10",
      cardHover: "hover:bg-brand/80",
      iconBg: "bg-white/10 text-foreground",
      description: "text-slate-800",
      primaryBtn: "bg-foreground text-white hover:bg-foreground/80",
      secondaryBtn:
        "bg-transparent border-foreground text-foreground hover:bg-white/10",
      // activeIndicator: "border-l-white",
    };
  }

  // Buyers / Developers / Climate Asset Allocators (Low-contrast brand-infused dark palette)
  return {
    bg: "bg-brand/85",
    title: "text-white",
    subtitle: "text-white/70",
    card: "bg-white/5 border-white/10",
    cardHover: "hover:bg-white/10",
    iconBg: "bg-white/10 text-white",
    description: "text-white/80",
    primaryBtn: "bg-white text-brand hover:bg-white/90",
    secondaryBtn: "bg-transparent border-white/20 text-white hover:bg-white/10",
    // activeIndicator: "border-l-white",
  };
};

export default function GetStartedPage() {
  const { data: session, isLoading } = useSession();
  const userRole = session?.user?.role?.toLowerCase() || "buyer";
  const currentStyle = getPageStyles(userRole);

  // Retrieve the authorized features for the current user's role
  const activeFeaturesKeys =
    ROLE_FEATURE_MAP[session?.user?.role || "project_owner"] ||
    ROLE_FEATURE_MAP.project_owner;
  const activeFeatures = activeFeaturesKeys.map((key) => SYSTEM_FEATURES[key]);

  if (isLoading) {
    return (
      <div className={`min-h-screen bg-white flex items-center justify-center`}>
        <Loader2 className="w-10 h-10 text-slate-900 animate-spin" />
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${currentStyle.bg} flex flex-col items-center pt-5 px-1`}
    >
      {/* Page Header */}
      <div className="text-center mb-12">
        <h1 className={`text-4xl font-bold ${currentStyle.title} mb-3`}>
          Welcome to Crevy
        </h1>
        <p className={`${currentStyle.subtitle} text-sm`}>
          Choose any of the options below to get started
        </p>
      </div>

      {/* Dynamic Grid Mapping */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
        {activeFeatures.map((feature) => {
          const Icon = feature.icon;
          const isPrimary = feature.variant === "primary";

          return (
            <div
              key={feature.id}
              className={`${currentStyle.card} ${currentStyle.cardHover}  p-8 flex flex-col items-center text-center transition-all hover:cursor-pointer`}
            >
              {/* Icon Container */}
              <div
                className={`h-16 w-16 ${currentStyle.iconBg} flex items-center justify-center mb-6`}
              >
                <Icon className="h-6 w-6" strokeWidth={1.5} />
              </div>

              {/* Description */}
              <p
                className={`${currentStyle.description} text-sm mb-8 flex-grow leading-relaxed px-4`}
              >
                {feature.description}
              </p>

              {/* Action Button */}
              <Button
                className={`w-full max-w-[200px] py-6 font-semibold transition-colors rounded-none ${
                  isPrimary
                    ? currentStyle.primaryBtn
                    : currentStyle.secondaryBtn
                }`}
                variant={isPrimary ? "default" : "outline"}
                asChild
              >
                <a href={feature.href}>{feature.buttonText}</a>
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
