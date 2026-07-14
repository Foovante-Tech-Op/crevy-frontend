"use client";

import { ArrowRight, Sprout, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth";

export function OnboardingBanner() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [hasOnboarded, setHasOnboarded] = useState<boolean | null>(null);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const session = await authClient.getSession();

        // Only show for project developers who haven't onboarded
        if ((session?.data?.user as any)?.hasOnboarded === false) {
          setHasOnboarded(false);
          // Check if user has dismissed the banner in this session
          const dismissed = sessionStorage.getItem(
            "onboarding-banner-dismissed",
          );
          if (!dismissed) {
            setIsVisible(true);
          }
        } else {
          setHasOnboarded(true);
        }
      } catch (error) {
        console.error("Failed to check onboarding status:", error);
      }
    };

    checkOnboardingStatus();
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem("onboarding-banner-dismissed", "true");
    setTimeout(() => {
      setIsVisible(false);
    }, 300);
  };

  const handleCompleteProfile = () => {
    handleDismiss();
    setTimeout(() => {
      router.push("/dashboard/profile/complete");
    }, 300);
  };

  if (!isVisible || hasOnboarded === null || hasOnboarded === true) {
    return null;
  }

  return (
    <div
      className={`bg-brand border-b border-slate-900 transition-all duration-300 ${
        isDismissed
          ? "opacity-0 -translate-y-full"
          : "opacity-100 translate-y-0"
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="hidden sm:flex w-10 h-10 bg-slate-900 border border-slate-900 items-center justify-center flex-shrink-0">
              <Sprout className="w-5 h-5 text-brand" strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 mb-0.5">
                Complete Your Project Developer Profile
              </p>
              <p className="text-xs text-slate-700 leading-relaxed">
                Add your payment details and farm plot information to start
                managing carbon projects.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={handleCompleteProfile}
              className="bg-slate-900 text-white hover:bg-slate-800 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              Complete Profile
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="text-slate-900 hover:text-slate-700 transition-colors p-2"
              aria-label="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
