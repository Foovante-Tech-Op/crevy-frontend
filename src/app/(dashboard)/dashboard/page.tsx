"use client";

import { authClient } from "@/lib/auth";
import type { TBetterAuthUser } from "@/types/user.types";
import AdminDashboard from "./_components/AdminDashboard";
import OrgAdminDashboard from "./_components/OrgAdminDashboard";
import ProjectOwnerDashboard from "./_components/ProjectOwnerDashboard";
import SuperAdminDashboard from "./_components/SuperAdminDashboard";

const LOADING_UI = (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="flex flex-col items-center gap-4">
      <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-900 rounded-none animate-spin" />
      <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400">
        Initializing Secure Terminal...
      </p>
    </div>
  </div>
);

// Shown when the session resolved but role is still null —
// i.e. the user exists in the DB but has no role assigned yet.
const NO_ROLE_UI = (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="flex flex-col items-center gap-4 max-w-sm text-center">
      <div className="w-10 h-10 border-2 border-amber-300 flex items-center justify-center">
        <span className="text-amber-500 font-mono font-bold text-lg">!</span>
      </div>
      <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500">
        Role Not Assigned
      </p>
      <p className="text-xs text-slate-400 font-sans leading-relaxed">
        Your account does not have a role yet. Please contact your administrator
        to be assigned access.
      </p>
    </div>
  </div>
);

export default function DashboardRouter() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) return LOADING_UI;

  const user = session?.user as TBetterAuthUser | undefined;
  const role = user?.role;

  // Session resolved but role is null → user has no roleId in the DB.
  // Show a clear message rather than silently falling through to project_owner.
  if (!role) {
    console.warn("[DashboardRouter] session.user.role is null/undefined.", {
      userId: user?.id,
      roleId: user?.roleId,
    });
    return NO_ROLE_UI;
  }

  const userName = user?.name || "Operative";

  switch (role) {
    case "super_admin":
      return <SuperAdminDashboard userName={userName} />;
    case "admin":
    case "project_manager":
    case "mrv_admin":
    case "financial_admin":
      return <AdminDashboard userName={userName} role={role} />;
    case "org_admin":
    case "sustainability_manager":
    case "org_auditor":
      return <OrgAdminDashboard userName={userName} role={role} />;
    case "project_owner":
      return <ProjectOwnerDashboard userName={userName} role={role} />;
    default:
      // Unknown role string coming from the DB — log it and fail visibly.
      console.error("[DashboardRouter] Unrecognised role:", role);
      return NO_ROLE_UI;
  }
}
