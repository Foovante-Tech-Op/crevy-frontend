import {
  BarChart3,
  Calculator,
  ClipboardCheck,
  FileUp,
  MapPin,
  ShieldCheck,
  ShoppingBag,
  Users,
} from "lucide-react";
import Link from "next/link";
import type { TRole } from "@/types/user.types";

interface QuickActionsProps {
  role: TRole;
}

const QuickActions = ({ role }: QuickActionsProps) => {
  const getActions = () => {
    switch (role) {
      case "financial_admin":
        return [
          {
            title: "Join Marketplace",
            description: "Discover and invest in sustainable projects",
            icon: <ShoppingBag className="h-6 w-6 stroke-white" />,
            color: "bg-blue-500",
            href: "/marketplace",
          },
          {
            title: "Impact Analytics",
            description: "View detailed environmental impact reports",
            icon: <BarChart3 className="h-6 w-6 stroke-white" />,
            color: "bg-brand-500",
            href: "/analytics",
          },
          {
            title: "Request Compliance",
            description: "Submit carbon credit certificates for audit",
            icon: <ShieldCheck className="h-6 w-6 stroke-white" />,
            color: "bg-amber-500",
            href: "/compliance",
          },
        ];
      case "super_admin":
      case "mrv_admin":
      case "project_manager":
        return [
          {
            title: "User Management",
            description: "Manage platform users and businesses",
            icon: <Users className="h-6 w-6 stroke-white" />,
            color: "bg-indigo-500",
            href: "/user-management",
          },
          {
            title: "Log Site Visit",
            description: "Submit geolocated evidence on-site",
            icon: <MapPin className="h-6 w-6 stroke-white" />,
            color: "bg-brand-500",
            href: "/site-visits",
          },
          {
            title: "Verification Queue",
            description: "Process submitted project documents",
            icon: <ClipboardCheck className="h-6 w-6 stroke-white" />,
            color: "bg-rose-500",
            href: "/track-verification",
          },
        ];
      default:
        return [
          {
            title: "Start a new project",
            description: "Submit your green project for estimation",
            icon: <FileUp className="h-6 w-6 stroke-white" />,
            color: "bg-blue-500",
            href: "/new-project",
          },
          {
            title: "Carbon Calculator",
            description: "Estimate potential CO₂ savings",
            icon: <Calculator className="h-6 w-6 stroke-white" />,
            color: "bg-brand-500",
            href: "/carbon-calculator",
          },
          {
            title: "Track Verification",
            description: "Monitor certification progress",
            icon: <ShieldCheck className="h-6 w-6 stroke-white" />,
            color: "bg-amber-500",
            href: "/track-verification",
          },
        ];
    }
  };

  const actions = getActions();

  return (
    <div className="mx-auto max-w-5xl">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">
        Quick Actions
      </h3>
      <div className="grid gap-4 md:grid-cols-3">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-brand-200 hover:shadow-md"
          >
            <div
              className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg ${action.color} transition-transform group-hover:scale-110`}
            >
              {action.icon}
            </div>
            <h4 className="mb-2 font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">
              {action.title}
            </h4>
            <p className="text-sm text-gray-600">{action.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
