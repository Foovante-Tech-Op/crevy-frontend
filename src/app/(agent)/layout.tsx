import { redirect } from "next/navigation";
import type React from "react";
import { AgentShell } from "@/components/AgentShell";
import { getServerSession } from "@/lib/auth-server";
import type { TBetterAuthUser } from "@/types";

// F1 — auth gate for the field-agent-facing app. Mirrors the pattern in
// (dashboard)/layout.tsx (server-side session check, redirect to /login if
// absent) but renders the lightweight AgentShell instead of the admin
// dashboard chrome, and additionally redirects anyone who isn't a
// field_agent — this app has no admin-relevant screens, so there's nothing
// useful for other roles to see here.
const AgentLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  const user = session.user as TBetterAuthUser;

  if (user.role && user.role !== "field_agent") {
    // Not a field agent — send them to the dashboard they DO have access to
    // rather than showing an empty/broken agent app.
    redirect("/dashboard");
  }

  return <AgentShell>{children}</AgentShell>;
};

export default AgentLayout;
