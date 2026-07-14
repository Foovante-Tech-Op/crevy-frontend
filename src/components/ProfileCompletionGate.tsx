"use client";

// src/components/ProfileCompletionGate.tsx
//
// Drives the "complete your profile" banner + modal for self-registered
// project developers. `hasOnboarded` comes from the server-rendered
// session (customSession on the backend) — explicit `false` means this
// developer signed up through the lightweight register form and still
// owes us payment details + a farm plot; `null`/`true` render nothing.

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { FieldLabel, TextField } from "@/app/(auth)/_components/form-fields";
import {
  completeProfileDefaultValues,
  completeProfileFormSchema,
  PAYMENT_METHOD_OPTIONS,
  type TCompleteProfileForm,
} from "@/constants/complete-profile";
import { useCompleteProjectDeveloperProfile } from "@/hooks/use-project-developer";
import { cn } from "@/lib/utils";
import type { TBetterAuthUser } from "@/types";

export function ProfileCompletionGate({
  user,
}: {
  user: TBetterAuthUser | null;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Only render for project developers who explicitly haven't onboarded.
  // `null` (buyers, or session not yet resolved) and `true` (already done)
  // both render nothing.
  if (!user || user.hasOnboarded !== false || dismissed) return null;

  return (
    <>
      <div className="border-b border-amber-300 bg-amber-50 px-4 py-3">
        <div className="mx-auto flex max-w-[1400px] flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <p className="text-sm text-amber-900">
            <span className="font-bold">Your profile is incomplete.</span> Add
            your payment details and project site to unlock project
            registration.
          </p>
          <div className="flex shrink-0 items-center gap-4">
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="bg-amber-900 text-white px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-slate-900 transition-colors"
            >
              Complete Profile
            </button>
            <button
              type="button"
              onClick={() => setDismissed(true)}
              aria-label="Dismiss"
              className="text-amber-700 hover:text-amber-900"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </div>

      {modalOpen && (
        <CompleteProfileModal onClose={() => setModalOpen(false)} />
      )}
    </>
  );
}

// Exported so pages like the dashboard can open the same modal directly
// (e.g. from a "Complete Profile" CTA gating project registration) without
// going through the banner's own dismiss/open state.
export function CompleteProfileModal({ onClose }: { onClose: () => void }) {
  const { mutateAsync, isPending } = useCompleteProjectDeveloperProfile();

  // Lock scroll on both <html> and <body> so the page behind the modal
  // doesn't scroll. Compensate for scrollbar width to prevent layout shift.
  useEffect(() => {
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, []);

  const { control, handleSubmit, watch } = useForm<TCompleteProfileForm>({
    resolver: zodResolver(completeProfileFormSchema) as any,
    defaultValues: completeProfileDefaultValues,
    mode: "onTouched",
  });

  const paymentMethod = watch("paymentMethod");
  const isBank = paymentMethod === "Bank Account";

  const onSubmit = async (data: TCompleteProfileForm) => {
    try {
      await mutateAsync({
        bankDetails: isBank
          ? {
              bankName: data?.bankName as string,
              accountNumber: data?.accountNumber as string,
              accountName: data?.bankAccountName || undefined,
            }
          : null,
        momoDetails: !isBank
          ? {
              network: data?.network as string,
              number: data?.momoNumber as string,
              accountName: data?.momoAccountName || undefined,
            }
          : null,
        farmPlot: {
          region: data?.region,
          village: data?.village || null,
          centroid: {
            lat: Number(data?.latitude),
            lng: Number(data?.longitude),
          },
          areaHectares: Number(data?.areaHectares),
        },
      });
      onClose();
    } catch {
      // Error toast already handled by the hook; keep the modal open so
      // the person can fix and retry without re-entering everything.
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 p-8 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Complete Your Profile
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-900"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <section className="space-y-4">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900 pb-2 border-b border-slate-200">
              Payment Details
            </p>

            <div className="space-y-3">
              <FieldLabel required>Payment Method</FieldLabel>
              <div className="flex gap-2">
                {PAYMENT_METHOD_OPTIONS.map((option) => (
                  <Controller
                    key={option}
                    control={control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <button
                        type="button"
                        onClick={() => field.onChange(option)}
                        className={cn(
                          "flex-1 px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest border transition-colors",
                          field.value === option
                            ? "bg-slate-900 border-slate-900 text-white"
                            : "bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-400",
                        )}
                      >
                        {option}
                      </button>
                    )}
                  />
                ))}
              </div>
            </div>

            {isBank ? (
              <div className="space-y-4">
                <TextField
                  control={control}
                  name="bankName"
                  label="Bank Name"
                  required
                />
                <TextField
                  control={control}
                  name="accountNumber"
                  label="Account Number"
                  required
                />
                <TextField
                  control={control}
                  name="bankAccountName"
                  label="Account Name (Optional)"
                />
              </div>
            ) : (
              <div className="space-y-4">
                <TextField
                  control={control}
                  name="network"
                  label="Network (e.g. MTN, Telecel)"
                  required
                />
                <TextField
                  control={control}
                  name="momoNumber"
                  label="Mobile Money Number"
                  required
                />
                <TextField
                  control={control}
                  name="momoAccountName"
                  label="Account Name (Optional)"
                />
              </div>
            )}
          </section>

          <section className="space-y-4">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900 pb-2 border-b border-slate-200">
              Farm / Project Site
            </p>
            <TextField
              control={control}
              name="region"
              label="Region"
              required
            />
            <TextField
              control={control}
              name="village"
              label="Village (Optional)"
            />
            <div className="grid grid-cols-2 gap-4">
              <TextField
                control={control}
                name="latitude"
                label="Latitude"
                required
              />
              <TextField
                control={control}
                name="longitude"
                label="Longitude"
                required
              />
            </div>
            <TextField
              control={control}
              name="areaHectares"
              label="Area (Hectares)"
              required
            />
          </section>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-brand text-slate-900 px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-slate-900 hover:text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isPending ? (
              <>
                <Loader2 className="animate-spin h-4 w-4" /> Saving...
              </>
            ) : (
              "Save & Continue"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
