"use client";

import { ArrowLeft, Loader2, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";

import { axiosClient } from "@/lib/axiosClient";

// 1. Move the page logic into a child component that safely consumes useSearchParams()
function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Countdown timer for resend button
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(
        () => setResendCooldown(resendCooldown - 1),
        1000,
      );
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleResendVerification = async () => {
    if (!email || resendCooldown > 0) return;

    setIsResending(true);
    try {
      await axiosClient.post("/auth/resend-verification", { email });
      toast.success("Verification email sent! Please check your inbox.");
      setResendCooldown(60); // 60 second cooldown
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          "Failed to send email. Please try again.",
      );
    } finally {
      setIsResending(false);
    }
  };

  const handleChangeEmail = () => {
    router.push(`/auth/change-email?email=${encodeURIComponent(email)}`);
  };

  return (
    <div className="min-h-screen w-full flex bg-slate-50 font-sans">
      {/* Left: Editorial Panel */}
      <div className="hidden lg:flex lg:w-[54%] xl:w-[58%] relative overflow-hidden bg-foreground">
        <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/50 to-transparent" />

        <div className="relative z-10 flex flex-col justify-between w-full p-12 xl:p-20 h-full">
          <div className="inline-flex items-center gap-3">
            <div className="w-8 h-[1px] bg-brand"></div>
            <span className="text-brand text-[10px] font-mono font-bold tracking-[0.2em] uppercase">
              Email Verification
            </span>
          </div>

          <div className="space-y-8 max-w-2xl mt-auto mb-16">
            <h2 className="text-5xl xl:text-7xl font-bold text-white leading-[1.05] tracking-tight">
              Verify your email to{" "}
              <span className="text-brand italic font-light">
                unlock access.
              </span>
            </h2>
            <p className="text-slate-300 font-light text-lg xl:text-xl leading-relaxed max-w-xl">
              We need to confirm your email address to ensure account security
              and send you important updates about your carbon market
              activities.
            </p>
          </div>
        </div>
      </div>

      {/* Right: Verification Panel */}
      <div className="relative flex flex-col w-full lg:w-[46%] xl:w-[42%] bg-white px-8 md:px-16 py-12 h-full overflow-y-auto">
        <div className="flex items-center justify-between mb-16 shrink-0 border-b border-slate-200 pb-6">
          <Link
            href="/"
            className="font-bold text-3xl text-slate-900 tracking-tight"
          >
            Crevy<span className="text-brand">.</span>
          </Link>
        </div>

        <div className="flex flex-1 flex-col max-w-md w-full mx-auto justify-center">
          <div className="mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-brand border border-slate-900 mb-6">
              <Mail className="w-8 h-8 text-slate-900" strokeWidth={1.5} />
            </div>

            <h1 className="text-4xl font-bold text-slate-900 tracking-tight leading-none mb-3">
              Verify Your Email
            </h1>
            <p className="text-sm text-slate-500 font-light leading-relaxed">
              We've sent a verification link to your email address. Click the
              link to activate your account and access the Crevy platform.
            </p>
          </div>

          <div className="space-y-6">
            {/* Email Display */}
            {email && (
              <div className="bg-slate-50 border border-slate-200 p-6">
                <p className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">
                  Verification Email Sent To
                </p>
                <p className="font-mono text-sm text-slate-900 break-all">
                  {email}
                </p>
              </div>
            )}

            {/* Instructions */}
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-brand border border-slate-900 flex items-center justify-center">
                  <span className="text-slate-900 font-bold text-sm">1</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-900 font-bold mb-1">
                    Check your inbox
                  </p>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Look for an email from Crevy with the subject "Verify your
                    email address"
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-brand border border-slate-900 flex items-center justify-center">
                  <span className="text-slate-900 font-bold text-sm">2</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-900 font-bold mb-1">
                    Click the verification link
                  </p>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    The link will confirm your email and activate your account
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-brand border border-slate-900 flex items-center justify-center">
                  <span className="text-slate-900 font-bold text-sm">3</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-900 font-bold mb-1">
                    Return to login
                  </p>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    After verifying, you can log in and access all features
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-6">
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={isResending || resendCooldown > 0}
                className="w-full bg-brand text-slate-900 rounded-none px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-slate-900 hover:text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isResending ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4" /> Sending...
                  </>
                ) : resendCooldown > 0 ? (
                  `Resend in ${resendCooldown}s`
                ) : (
                  "Resend Verification Email"
                )}
              </button>

              <button
                type="button"
                onClick={handleChangeEmail}
                className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-none px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Change Email / Typo?
              </button>

              <Link
                href="/login"
                className="block w-full bg-slate-900 text-white rounded-none px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-brand hover:text-slate-900 transition-colors text-center"
              >
                Go to Login
              </Link>
            </div>

            {/* Help Text */}
            <div className="pt-6 border-t border-slate-200">
              <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest leading-relaxed">
                Didn't receive the email? Check your spam folder or{" "}
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={resendCooldown > 0}
                  className="text-slate-900 hover:text-brand underline underline-offset-4 disabled:opacity-50"
                >
                  click here to resend
                </button>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 2. Export the parent component wrapped in Suspense to satisfy Next.js static rendering
export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-50">
          <Loader2 className="animate-spin h-8 w-8 text-slate-900" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
