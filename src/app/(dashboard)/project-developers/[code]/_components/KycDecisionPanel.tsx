"use client";

import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, Loader2, RotateCcw, XCircle } from "lucide-react";
import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { getErrorMessage } from "@/lib/errors";
import { ProjectOwnerService } from "@/lib/services/project-owner-service";

type VerificationStatus = "pending" | "verified" | "rejected";

type Props = {
  developerId: string;
  developerName: string;
  status: VerificationStatus;
  verifiedByName?: string | null;
  verifiedAt?: string | null;
  rejectionReason?: string | null;
  onDecided: () => void;
};

/**
 * The admin KYC review control.
 *
 * A field agent registers a developer on-site and they land in 'pending'.
 * Nothing moved them out of it before this existed — the status was rendered
 * everywhere and settable nowhere, so every developer stayed pending forever.
 *
 * Any status can move to any other, so a rejection made in error, or one the
 * developer has since corrected, is fixed here rather than in the database.
 * The backend writes an audit_log row per transition, so the sequence survives
 * even though only the latest decision is stored on the record.
 */
export function KycDecisionPanel({
  developerId,
  developerName,
  status,
  verifiedByName,
  verifiedAt,
  rejectionReason,
  onDecided,
}: Props) {
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");

  const mutation = useMutation({
    mutationFn: (payload: { status: VerificationStatus; reason?: string }) =>
      ProjectOwnerService.setVerificationStatus(developerId, payload),
    onSuccess: (_res, variables) => {
      toast.success(
        variables.status === "verified"
          ? `${developerName} verified.`
          : variables.status === "rejected"
            ? `${developerName} rejected.`
            : `${developerName} returned to pending review.`,
      );
      setRejectOpen(false);
      setReason("");
      onDecided();
    },
    onError: (error) =>
      toast.error(
        getErrorMessage(
          error,
          "We couldn't save that decision. Please try again.",
        ),
      ),
  });

  const busy = mutation.isPending;
  // Required by the API on a rejection, and it is what the registering field
  // agent reads to know what to correct — so the button stays disabled rather
  // than letting the request 400.
  const reasonIsUsable = reason.trim().length > 0;

  return (
    <div className="border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-sans font-bold text-slate-950 mb-1">
        KYC Review
      </h2>
      <p className="text-xs text-slate-500 mb-5">
        {status === "pending"
          ? "Review the captured details above, then verify or reject this developer."
          : status === "verified"
            ? "This developer has been verified."
            : "This developer was rejected."}
      </p>

      {status !== "pending" && (
        <div className="mb-5 space-y-1 border-l-2 border-slate-200 pl-4">
          {verifiedByName && (
            <p className="text-xs text-slate-600">
              <span className="text-slate-400">Decision by</span>{" "}
              <span className="font-semibold text-slate-900">
                {verifiedByName}
              </span>
              {verifiedAt && (
                <>
                  {" "}
                  <span className="text-slate-400">on</span>{" "}
                  <span className="font-semibold text-slate-900">
                    {new Date(verifiedAt).toLocaleDateString()}
                  </span>
                </>
              )}
            </p>
          )}
          {status === "rejected" && rejectionReason && (
            <p className="text-xs text-slate-600">
              <span className="text-slate-400">Reason</span>{" "}
              <span className="text-slate-900">{rejectionReason}</span>
            </p>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {status !== "verified" && (
          <Button
            onClick={() => mutation.mutate({ status: "verified" })}
            disabled={busy}
            className="rounded-none bg-emerald-700 hover:bg-emerald-800 text-white text-[10px] font-bold uppercase tracking-widest h-11 px-6"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4 mr-2" />
            )}
            Verify
          </Button>
        )}

        {status !== "rejected" && (
          <Button
            onClick={() => setRejectOpen(true)}
            disabled={busy}
            variant="outline"
            className="rounded-none border-red-200 text-red-700 hover:bg-red-50 text-[10px] font-bold uppercase tracking-widest h-11 px-6"
          >
            <XCircle className="h-4 w-4 mr-2" /> Reject
          </Button>
        )}

        {status !== "pending" && (
          <Button
            onClick={() => mutation.mutate({ status: "pending" })}
            disabled={busy}
            variant="outline"
            className="rounded-none border-slate-200 text-slate-600 hover:bg-slate-50 text-[10px] font-bold uppercase tracking-widest h-11 px-6"
          >
            <RotateCcw className="h-4 w-4 mr-2" /> Return to Pending
          </Button>
        )}
      </div>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="rounded-none">
          <DialogHeader>
            <DialogTitle>Reject {developerName}?</DialogTitle>
            <DialogDescription>
              The field agent who registered them will see this reason, so say
              what needs correcting.
            </DialogDescription>
          </DialogHeader>

          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. The ID photo is unreadable — please recapture it on site."
            className="min-h-28 rounded-none"
            maxLength={1000}
          />

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectOpen(false)}
              disabled={busy}
              className="rounded-none"
            >
              Cancel
            </Button>
            <Button
              onClick={() =>
                mutation.mutate({ status: "rejected", reason: reason.trim() })
              }
              disabled={busy || !reasonIsUsable}
              className="rounded-none bg-red-700 hover:bg-red-800 text-white"
            >
              {busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Reject developer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
