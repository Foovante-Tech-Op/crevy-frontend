"use client";

import { ArrowRight, Sprout, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const router = useRouter();
  const [isDismissing, setIsDismissing] = useState(false);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleCompleteNow = () => {
    setIsDismissing(true);
    onClose();
    // Small delay to allow modal to close before navigation
    setTimeout(() => {
      router.push("/dashboard/profile/complete");
    }, 300);
  };

  const handleLater = () => {
    setIsDismissing(true);
    onClose();
    toast.info("You can complete your profile later from the dashboard.");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        className={`bg-white border border-slate-200 max-w-lg w-full shadow-2xl transition-all duration-300 ${
          isDismissing ? "opacity-0 scale-95" : "opacity-100 scale-100"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand border border-slate-900 flex items-center justify-center">
              <Sprout className="w-5 h-5 text-slate-900" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Complete Your Profile
              </h2>
              <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
                Project Developer Onboarding
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLater}
            className="text-slate-400 hover:text-slate-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="space-y-3">
            <p className="text-sm text-slate-600 leading-relaxed">
              Welcome to Crevy! To access all features and start managing your
              carbon projects, we need some additional information.
            </p>
          </div>

          {/* What we need */}
          <div className="space-y-3">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900">
              Information Required:
            </p>
            <div className="space-y-2">
              <div className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-200">
                <div className="w-6 h-6 bg-brand border border-slate-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-slate-900 font-bold text-xs">1</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 mb-1">
                    Payment Details
                  </p>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Bank account or mobile money information for receiving
                    payments from carbon credit sales.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-200">
                <div className="w-6 h-6 bg-brand border border-slate-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-slate-900 font-bold text-xs">2</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 mb-1">
                    Farm Plot / Project Site
                  </p>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Location details and area information for your carbon
                    projects.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="bg-brand/10 border border-brand/30 p-4">
            <p className="text-xs text-slate-700 leading-relaxed">
              <span className="font-bold">Why complete your profile?</span> This
              information is required for project verification, payment
              processing, and compliance with carbon market regulations.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-slate-200 space-y-3">
          <button
            type="button"
            onClick={handleCompleteNow}
            className="w-full bg-brand text-slate-900 rounded-none px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-slate-900 hover:text-white transition-colors flex items-center justify-center gap-2"
          >
            Complete Profile Now
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleLater}
            className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-none px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-slate-100 transition-colors"
          >
            I'll Do This Later
          </button>
        </div>
      </div>
    </div>
  );
}
