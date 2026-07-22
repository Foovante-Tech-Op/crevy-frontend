"use client";

import { LogOut, Mail, Phone, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useUser } from "@/hooks/use-user";
import { authClient } from "@/lib/auth";

// F5 — Profile screen. Read-only except sign-out. Nothing else — field
// agents don't manage settings here, that's an admin concern.

export default function AgentProfilePage() {
  const { user } = useUser();
  const router = useRouter();

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/login");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-slate-900">Profile</h1>

      <Card>
        <CardContent className="py-6 flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white text-xl font-semibold">
            {user?.firstName?.charAt(0)?.toUpperCase() || (
              <UserRound className="h-6 w-6" />
            )}
          </div>
          <div>
            <div className="font-semibold text-lg text-slate-900">
              {user?.firstName} {user?.lastName}
            </div>
            <div className="text-xs text-slate-400 uppercase tracking-wide">
              Field Agent
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="py-4 space-y-4">
          <div className="flex items-center gap-3 text-sm">
            <Mail className="h-4 w-4 text-slate-400 shrink-0" />
            <span className="text-slate-700">{user?.email}</span>
          </div>
          {(user as any)?.contactNumber && (
            <div className="flex items-center gap-3 text-sm">
              <Phone className="h-4 w-4 text-slate-400 shrink-0" />
              <span className="text-slate-700">
                {(user as any).contactNumber}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      <Button
        variant="outline"
        onClick={handleLogout}
        className="w-full justify-center border-red-200 text-red-700 hover:bg-red-50"
      >
        <LogOut className="h-4 w-4 mr-2" /> Log out
      </Button>
    </div>
  );
}
