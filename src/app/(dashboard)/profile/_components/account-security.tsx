"use client";

import { AlertTriangle, ShieldCheck, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth";
import { UserService } from "@/lib/services/user-service";

export function AccountSecurity({ user }: { user: any }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        "CRITICAL WARNING: Permanent ledger deletion. This action cannot be reversed. Proceed?",
      )
    )
      return;
    setIsDeleting(true);
    try {
      await UserService.deleteUserProfile(user.id);
      await authClient.signOut();
      toast.success("Entity ledger permanently purged.");
      router.push("/register");
    } catch (error: any) {
      toast.error(
        error.message || "Failed to purge ledger. Contact Governance.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="border border-red-200 bg-white">
      <div className="p-6 border-b border-red-200 bg-red-50 flex items-center gap-4">
        <AlertTriangle className="w-5 h-5 text-red-600" />
        <div>
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-900">
            Critical Protocols
          </h2>
          <p className="text-xs text-red-700/70 font-mono mt-1">
            Irreversible system actions
          </p>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 p-6 border border-slate-200 bg-slate-50">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900 flex items-center gap-2 mb-1">
              <ShieldCheck className="w-4 h-4 text-brand-600" /> Multi-Factor
              Auth (MFA)
            </p>
            <p className="text-xs font-mono text-slate-500">
              Require cryptographic secondary verification for access.
            </p>
          </div>
          <Button
            variant="outline"
            className="rounded-none border-slate-300 text-[10px] font-bold uppercase tracking-widest h-10 px-6 opacity-50 cursor-not-allowed"
          >
            Offline (Pending Setup)
          </Button>
        </div>

        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 p-6 border border-red-200 bg-red-50/50">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-900 flex items-center gap-2 mb-1">
              <Trash2 className="w-4 h-4 text-red-600" /> Purge Entity Ledger
            </p>
            <p className="text-xs font-mono text-red-700/70">
              Permanently erase identity and all linked non-immutable records.
            </p>
          </div>
          <Button
            variant="destructive"
            onClick={handleDeleteAccount}
            disabled={isDeleting}
            className="rounded-none bg-red-700 hover:bg-red-800 text-white font-bold text-[10px] uppercase tracking-widest h-10 px-6 transition-colors"
          >
            {isDeleting ? "Purging..." : "Initiate Purge"}
          </Button>
        </div>
      </div>
    </div>
  );
}
