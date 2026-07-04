"use client";
import DashboardLoading from "@/components/DashboardLoading";
import { useUser } from "@/hooks/use-user";
import AdminDashboard from "./_components/AdminDashboard";
import AuditorDashboard from "./_components/auditor/AuditorDashboard";
import OrgAdminDashboard from "./_components/OrgAdminDashboard";
import ProjectDeveloperDashboard from "./_components/ProjectDeveloperDashboard";
import SuperAdminDashboard from "./_components/SuperAdminDashboard";

export default function DashboardPage() {
  const { user, isPending } = useUser();

  if (isPending) return <DashboardLoading />;
  if (!user) return null;
  const role = user.role;
  const userName = user.name || "User";
  switch (role) {
    case "super_admin":
      return <SuperAdminDashboard userName={userName} />;
    case "admin":
    case "project_manager":
      return <AdminDashboard userName={userName} role={role} />;
    case "org_admin":
      return <OrgAdminDashboard userName={userName} role={role} />;
    case "org_auditor":
      return <AuditorDashboard />;
    default:
      return (
        <ProjectDeveloperDashboard userName={userName} role={role as string} />
      );
  }
}
