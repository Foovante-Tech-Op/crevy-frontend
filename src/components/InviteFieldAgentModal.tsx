"use client";

import { Loader2, UserPlus } from "lucide-react";
import { useState } from "react";
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
import { getErrorMessage } from "@/lib/errors";
import { FieldAgentService } from "@/lib/services/field-agent-service";

interface InviteFieldAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvited?: () => void;
}

/** Normalize the email on the client before sending. Mirrors the
 *  server-side `normalizeEmail` in FieldAgentService — so a paste of
 *  `  John@Example.COM ` and `john@example.com` are treated identically
 *  by the duplicate-prevention checks. Trim happens here (good UX, the
 *  input loses any accidental whitespace); lowercasing happens here too
 *  (also fixes iOS auto-capitalize behavior on email fields). */
const normalizeEmailClient = (raw: string) => raw.trim().toLowerCase();

export function InviteFieldAgentModal({
  isOpen,
  onClose,
  onInvited,
}: InviteFieldAgentModalProps) {
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
    },
  });

  const onSubmit = async (data: {
    fullName: string;
    email: string;
    phone: string;
  }) => {
    setLoading(true);
    try {
      const result = await FieldAgentService.inviteFieldAgent({
        fullName: data.fullName,
        email: normalizeEmailClient(data.email),
        phone: data.phone || undefined,
      });

      toast.success(
        result?.data?.reinvited
          ? "Invitation resent successfully"
          : `Invite sent to ${normalizeEmailClient(data.email)}`,
      );
      reset();
      onInvited?.();
      onClose();
    } catch (error: any) {
      // Surface the backend's specific message verbatim — these are
      // hand-written to be helpful (e.g. "already a registered field
      // agent", "Please wait 47s before resending") rather than the
      // generic axios fallback.
      const message = getErrorMessage(error, "Failed to invite field agent");
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl p-0 rounded-none border border-slate-900 shadow-2xl gap-0 bg-white">
        <DialogHeader className="p-8 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3 mb-4">
            <UserPlus size={20} className="text-slate-900" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900">
              Field Operations
            </span>
          </div>
          <DialogTitle className="text-3xl font-sans text-slate-900 tracking-tight leading-none mb-2">
            Invite Field Agent
          </DialogTitle>
          <DialogDescription className="text-slate-500 font-light text-sm">
            They'll get a link to set up their account and start registering
            developers on-site.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
          <div className="p-8 space-y-8">
            <div className="space-y-3">
              <Label
                htmlFor="fullName"
                className="text-[10px] font-bold uppercase tracking-widest text-slate-400"
              >
                Full Name
              </Label>
              <Input
                id="fullName"
                placeholder="Kwame Mensah"
                {...register("fullName", { required: true, minLength: 2 })}
                required
                className="rounded-none border-0 border-b-2 border-slate-200 bg-slate-50 px-4 py-6 font-mono text-sm text-slate-900 placeholder:text-slate-400 focus-visible:ring-0 focus-visible:border-slate-900 transition-colors"
              />
            </div>

            <div className="space-y-3">
              <Label
                htmlFor="email"
                className="text-[10px] font-bold uppercase tracking-widest text-slate-400"
              >
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="agent@example.com"
                {...register("email", { required: true })}
                required
                className="rounded-none border-0 border-b-2 border-slate-200 bg-slate-50 px-4 py-6 font-mono text-sm text-slate-900 placeholder:text-slate-400 focus-visible:ring-0 focus-visible:border-slate-900 transition-colors"
              />
            </div>

            <div className="space-y-3">
              <Label
                htmlFor="phone"
                className="text-[10px] font-bold uppercase tracking-widest text-slate-400"
              >
                Phone (optional)
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+233 XX XXX XXXX"
                {...register("phone")}
                className="rounded-none border-0 border-b-2 border-slate-200 bg-slate-50 px-4 py-6 font-mono text-sm text-slate-900 placeholder:text-slate-400 focus-visible:ring-0 focus-visible:border-slate-900 transition-colors"
              />
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
              disabled={loading}
              className="rounded-none bg-foreground hover:bg-brand text-white px-8 py-6 text-[10px] font-bold uppercase tracking-widest transition-colors"
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
