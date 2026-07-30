import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type React from "react";
import { DashboardLayoutClient } from "@/components/DashboardLayout";
import { getServerSession } from "@/lib/auth-server";
import type { TBetterAuthUser } from "@/types";

const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  const user = session.user as TBetterAuthUser;

  // If role is missing from the session (customSession DB join didn't populate
  // it), try a single fallback fetch to the RBAC endpoint.
  // Important: route through the Next.js rewrite proxy (/api/v2/...) so the
  // request is same-origin and cookies are forwarded correctly. Never call
  // the Render URL directly from SSR — cold starts will hang the layout.
  if (!user.role) {
    const siteUrl =
      process.env.SITE_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXT_PUBLIC_SITE_URL;

    if (siteUrl) {
      // Hard 6s timeout — the layout must resolve before the platform (Vercel
      // 25s / CF Workers 30s) kills the request. getServerSession already used
      // up to 8s, so keep this tight.
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);

      try {
        const headersList = await headers();
        const cookie = headersList.get("cookie") ?? "";

        const roleResponse = await fetch(`${siteUrl}/api/v2/rbac/me/role`, {
          headers: { cookie },
          cache: "no-store",
          signal: controller.signal,
        });

        if (roleResponse.ok) {
          const roleData = await roleResponse.json();
          user.role = roleData.data?.role ?? null;
        }
      } catch (err: any) {
        if (err?.name === "AbortError") {
          console.error("[DashboardLayout] Role fetch timed out after 6s.");
        } else {
          console.error("[DashboardLayout] Failed to fetch user role:", err);
        }
        // Don't throw — render the layout without role; the dashboard page
        // will show the NO_ROLE_UI which is recoverable.
      } finally {
        clearTimeout(timeout);
      }
    } else {
      console.warn("[DashboardLayout] Skipping role fetch — SITE_URL not set.");
    }
  }

  // F3 — Field agents have their own dedicated (agent) app. Mirror the
  // redirect that (agent)/layout.tsx does in reverse: any field_agent who
  // lands on a /dashboard/* URL (via bookmark, typed URL, or stale link)
  // is sent straight to /agent instead of seeing the admin dashboard,
  // which is meaningless (and broken) for their role.
  if (user.role === "field_agent") {
    redirect("/agent");
  }

  return (
    <DashboardLayoutClient user={user}>
      <div className="flex-1">{children}</div>
    </DashboardLayoutClient>
  );
};

export default DashboardLayout;
