"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUser } from "@/hooks/use-user";
import { getErrorMessage } from "@/lib/errors";
import { notifyInviteResult } from "@/lib/invites";
import { RBACService } from "@/lib/services/rbac-service";

interface InviteAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InviteAdminModal({ isOpen, onClose }: InviteAdminModalProps) {
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const isSuperAdmin = user?.role === "super_admin";
  const isOrgAdmin = user?.role === "org_admin";

  const { register, handleSubmit, reset, setValue } = useForm({
    defaultValues: {
      email: "",
      roleName: isOrgAdmin ? "sustainability_manager" : "admin",
    },
  });

  const { data: rolesRes, isLoading: loadingRoles } = useQuery({
    queryKey: ["roles"],
    queryFn: RBACService.getRoles,
    enabled: isOpen,
  });

  const filteredRoles = useMemo(() => {
    const roles = rolesRes || [];

    // ── Role Filtering Logic ──
    if (isSuperAdmin) return roles;

    if (isOrgAdmin) {
      // Org admins can only invite sustainability managers and auditors
      return roles.filter((r: any) =>
        ["sustainability_manager", "org_auditor"].includes(r.name),
      );
    }

    // Other admins: Everything EXCEPT super_admin, org_admin, sustainability_manager
    return roles.filter(
      (r: any) =>
        !["super_admin", "org_admin", "sustainability_manager"].includes(
          r.name,
        ),
    );
  }, [rolesRes, isSuperAdmin, isOrgAdmin]);

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const result = await RBACService.inviteUser({
        email: data.email,
        roleName: data.roleName,
      });

      notifyInviteResult(
        result?.data,
        isOrgAdmin
          ? "Team member invited successfully"
          : "Admin invitation sent successfully",
      );
      reset();
      onClose();
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          "We couldn't send that invitation. Please try again.",
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl p-0 rounded-none border border-slate-900 shadow-2xl gap-0 bg-white">
        {/* ── Institutional Header ── */}
        <DialogHeader className="p-8 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3 mb-4">
            <ShieldCheck size={20} className="text-slate-900" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900">
              {isOrgAdmin
                ? "Organization Access Control"
                : "System Access Control"}
            </span>
          </div>
          <DialogTitle className="text-3xl font-sans text-slate-900 tracking-tight leading-none mb-2">
            {isOrgAdmin ? "Invite Team Member" : "Provision Credential"}
          </DialogTitle>
          <DialogDescription className="text-slate-500 font-light text-sm">
            {isOrgAdmin
              ? "Issue access to a new member of your organization."
              : "Issue access role to a new Crevy member."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
          <div className="p-8 space-y-8">
            <div className="space-y-3">
              <Label
                htmlFor="email"
                className="text-[10px] font-bold uppercase tracking-widest text-slate-400"
              >
                Target Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={
                  isOrgAdmin ? "colleague@company.com" : "officer@crevy.com"
                }
                {...register("email", { required: true })}
                required
                className="rounded-none border-0 border-b-2 border-slate-200 bg-slate-50 px-4 py-6 font-mono text-sm text-slate-900 placeholder:text-slate-400 focus-visible:ring-0 focus-visible:border-slate-900 transition-colors"
              />
            </div>

            <div className="space-y-3">
              <Label
                htmlFor="roleName"
                className="text-[10px] font-bold uppercase tracking-widest text-slate-400"
              >
                Clearance Level (Role)
              </Label>
              <Select
                onValueChange={(val) => setValue("roleName", val)}
                defaultValue={isOrgAdmin ? "sustainability_manager" : "admin"}
              >
                <SelectTrigger className="w-full rounded-none border-0 border-b-2 border-slate-200 bg-slate-50 px-4 py-6 font-mono text-sm text-slate-900 focus:ring-0 focus:border-slate-900 transition-colors">
                  <SelectValue placeholder="Select clearance level" />
                </SelectTrigger>
                <SelectContent className="rounded-none border border-slate-200 shadow-xl">
                  {loadingRoles ? (
                    <SelectItem
                      value="loading"
                      disabled
                      className="font-mono text-xs"
                    >
                      Fetching registry...
                    </SelectItem>
                  ) : (
                    filteredRoles.map((role: any) => (
                      <SelectItem
                        key={role.name}
                        value={role.name}
                        className="font-mono text-xs uppercase tracking-widest focus:bg-slate-50 focus:text-slate-900 cursor-pointer"
                      >
                        {role.name.replace(/_/g, " ")}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="p-6 bg-slate-50 border-t border-slate-200 flex sm:justify-between items-center gap-4">
            <Button
              variant="ghost"
              type="button"
              onClick={onClose}
              className="rounded-none text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 hover:bg-transparent"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || loadingRoles}
              className="rounded-none bg-slate-900 hover:bg-brand text-white px-8 py-6 text-[10px] font-bold uppercase tracking-widest transition-colors"
            >
              {loading ? (
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
              ) : (
                "Send Invite"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
