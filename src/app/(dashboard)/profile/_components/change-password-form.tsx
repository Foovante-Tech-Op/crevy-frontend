"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Lock, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { authClient } from "@/lib/auth";
import { getErrorMessage } from "@/lib/errors";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Required"),
    newPassword: z.string().min(8, "Min 8 chars"),
    confirmPassword: z.string().min(8, "Required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Hashes mismatch",
    path: ["confirmPassword"],
  });

export function ChangePasswordForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = async (values: z.infer<typeof passwordSchema>) => {
    setIsSubmitting(true);
    try {
      const { error } = await authClient.changePassword({
        newPassword: values.newPassword,
        currentPassword: values.currentPassword,
        revokeOtherSessions: true,
      });
      if (error) throw error;
      toast.success("Password updated.");
      form.reset();
    } catch (error: any) {
      toast.error(getErrorMessage(error, "We couldn't update your password."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="border border-slate-200 bg-white">
      <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center gap-4">
        <Lock className="w-5 h-5 text-slate-400" />
        <div>
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900">
            Access Credentials
          </h2>
          <p className="text-xs text-slate-500 font-mono mt-1">
            Manage cryptographic keys
          </p>
        </div>
      </div>
      <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6">
        <div className="space-y-3">
          <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Current Password
          </Label>
          <PasswordInput
            {...form.register("currentPassword")}
            className="rounded-none border-0 border-b-2 border-slate-200 bg-slate-50 px-4 py-6 font-mono text-sm focus-visible:ring-0 focus-visible:border-slate-900"
          />
        </div>
        <div className="space-y-3">
          <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            New Password
          </Label>
          <PasswordInput
            {...form.register("newPassword")}
            className="rounded-none border-0 border-b-2 border-slate-200 bg-slate-50 px-4 py-6 font-mono text-sm focus-visible:ring-0 focus-visible:border-slate-900"
          />
        </div>
        <div className="space-y-3">
          <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Verify New Password
          </Label>
          <PasswordInput
            {...form.register("confirmPassword")}
            className="rounded-none border-0 border-b-2 border-slate-200 bg-slate-50 px-4 py-6 font-mono text-sm focus-visible:ring-0 focus-visible:border-slate-900"
          />
        </div>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-none bg-slate-900 hover:bg-slate-800 text-white font-bold uppercase tracking-widest text-[10px] h-12 transition-colors"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <ShieldCheck className="w-4 h-4 mr-2" />
          )}{" "}
          Rotate Password
        </Button>
      </form>
    </div>
  );
}
