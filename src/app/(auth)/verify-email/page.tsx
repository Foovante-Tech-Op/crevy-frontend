"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Check, Loader2, Mail, X } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";

import GalleryBackground from "@/components/GalleryBackground";
import { axiosClient } from "@/lib/axiosClient";
import { getErrorMessage } from "@/lib/errors";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 60 : -60,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction > 0 ? -60 : 60,
    opacity: 0,
  }),
};

const SLIDE_TRANSITION = { duration: 0.32, ease: [0.22, 1, 0.36, 1] as const };

// 1. Move the page logic into a child component that safely consumes useSearchParams()
function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Local state so we can update the displayed address after a successful
  // change without a round trip through the URL.
  const [email, setEmail] = useState(searchParams.get("email") || "");

  const [view, setView] = useState<"default" | "changeEmail">("default");
  const [direction, setDirection] = useState(1);

  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const [newEmail, setNewEmail] = useState("");
  const [newEmailError, setNewEmailError] = useState<string | null>(null);
  const [isChangingEmail, setIsChangingEmail] = useState(false);

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
        getErrorMessage(
          err,
          "We couldn't send the verification email. Please try again.",
        ),
      );
    } finally {
      setIsResending(false);
    }
  };

  const openChangeEmail = () => {
    setNewEmail(email);
    setNewEmailError(null);
    setDirection(1);
    setView("changeEmail");
  };

  const cancelChangeEmail = () => {
    setNewEmailError(null);
    setDirection(-1);
    setView("default");
  };

  const handleSubmitNewEmail = async () => {
    const trimmed = newEmail.trim();

    if (!EMAIL_RE.test(trimmed)) {
      setNewEmailError("Enter a valid email address");
      return;
    }
    if (trimmed === email) {
      setNewEmailError("That's already your current email");
      return;
    }

    setNewEmailError(null);
    setIsChangingEmail(true);
    try {
      // Requires an authenticated session (requireAuth on the backend) —
      // this is the normal path since the person only reaches /verify-email
      // via the post-login redirect, where a session cookie already exists.
      await axiosClient.post("/auth/change-email", { email: trimmed });

      toast.success(
        "Email updated. We've sent a new verification link to your inbox.",
      );
      setEmail(trimmed);
      setResendCooldown(60); // the change-email call already sent one
      setDirection(-1);
      setView("default");
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 401) {
        toast.error("Please log in again before changing your email.");
        router.push("/login");
        return;
      }
      setNewEmailError(
        getErrorMessage(err, "Couldn't update your email. Please try again."),
      );
    } finally {
      setIsChangingEmail(false);
    }
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* Fixed masonry background — matches /register-interest */}
      <GalleryBackground parallax={false} dim={true} />

      {/* Cinematic dark overlay to elevate content isolation */}
      <div className="fixed inset-0 bg-foreground/40 backdrop-blur-xs pointer-events-none z-0" />

      {/* Fixed Top Left Logo Identifier */}
      <div className="fixed top-6 left-6 sm:top-8 sm:left-10 z-30">
        <Link
          href="/"
          className="font-bold text-3xl tracking-tight text-brand hover:text-slate-700 transition-colors"
        >
          Crevy.
        </Link>
      </div>

      {/* Centered container keeping the card stationary while its content slides */}
      <div className="relative z-10 flex items-center justify-center h-full w-full px-4 sm:px-6 lg:px-8 py-6 pt-28 md:pt-0 overflow-y-auto">
        <div className="w-full max-w-2xl bg-background/95 backdrop-blur-md border border-slate-200/10 p-8 sm:p-10 overflow-hidden">
          <AnimatePresence mode="wait" custom={direction} initial={false}>
            {view === "default" ? (
              <motion.div
                key="default"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={SLIDE_TRANSITION}
              >
                <div className="mb-10">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-brand border border-slate-900 mb-6">
                    <Mail
                      className="w-8 h-8 text-slate-900"
                      strokeWidth={1.5}
                    />
                  </div>

                  <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight leading-none mb-3">
                    Verify Your Email
                  </h1>
                  <p className="text-sm text-slate-500 font-light leading-relaxed">
                    We've sent a verification link to your email address. Click
                    the link to activate your account and access the Crevy
                    platform.
                  </p>
                </div>

                <div className="space-y-6">
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

                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-brand border border-slate-900 flex items-center justify-center">
                        <span className="text-slate-900 font-bold text-sm">
                          1
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-slate-900 font-bold mb-1">
                          Check your inbox
                        </p>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          Look for an email from Crevy with the subject "Verify
                          your email address"
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-brand border border-slate-900 flex items-center justify-center">
                        <span className="text-slate-900 font-bold text-sm">
                          2
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-slate-900 font-bold mb-1">
                          Click the verification link
                        </p>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          The link will confirm your email and activate your
                          account
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-brand border border-slate-900 flex items-center justify-center">
                        <span className="text-slate-900 font-bold text-sm">
                          3
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-slate-900 font-bold mb-1">
                          Return to login
                        </p>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          After verifying, you can log in and access all
                          features
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-6">
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      disabled={isResending || resendCooldown > 0}
                      className="w-full bg-brand text-slate-900 rounded-none px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-slate-900 hover:text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {isResending ? (
                        <>
                          <Loader2 className="animate-spin h-4 w-4" />{" "}
                          Sending...
                        </>
                      ) : resendCooldown > 0 ? (
                        `Resend in ${resendCooldown}s`
                      ) : (
                        "Resend Verification Email"
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={openChangeEmail}
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
              </motion.div>
            ) : (
              <motion.div
                key="changeEmail"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={SLIDE_TRANSITION}
              >
                <div className="mb-10">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-brand border border-slate-900 mb-6">
                    <Mail
                      className="w-8 h-8 text-slate-900"
                      strokeWidth={1.5}
                    />
                  </div>

                  <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight leading-none mb-3">
                    Update Your Email
                  </h1>
                  <p className="text-sm text-slate-500 font-light leading-relaxed">
                    We'll update your account and send a fresh verification link
                    to the new address.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 flex justify-between select-none">
                      New Email Address
                      {newEmailError && (
                        <span className="text-red-600 font-mono tracking-normal normal-case">
                          {newEmailError}
                        </span>
                      )}
                    </div>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => {
                        setNewEmail(e.target.value);
                        if (newEmailError) setNewEmailError(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleSubmitNewEmail();
                        }
                      }}
                      placeholder="you@newdomain.com"
                      disabled={isChangingEmail}
                      className="w-full bg-slate-50 border-0 border-b-2 border-slate-200 rounded-none p-4 font-mono text-sm text-slate-900 placeholder:text-slate-400 focus:ring-0 focus:border-slate-900 transition-colors disabled:opacity-50 outline-none"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={cancelChangeEmail}
                      disabled={isChangingEmail}
                      className="flex-1 bg-slate-50 text-slate-900 border border-slate-200 rounded-none px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-slate-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <X className="w-3.5 h-3.5" />
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmitNewEmail}
                      disabled={isChangingEmail || !newEmail.trim()}
                      className="flex-1 bg-brand text-slate-900 rounded-none px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-slate-900 hover:text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {isChangingEmail ? (
                        <>
                          <Loader2 className="animate-spin h-4 w-4" /> Saving...
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          Submit
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// A clean, simple skeleton fallback that keeps layout shifts to a minimum
// while useSearchParams() resolves — mirrors register-interest's fallback.
function VerifyEmailLoadingFallback() {
  return (
    <div className="relative h-screen w-screen overflow-hidden flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin h-8 w-8 text-slate-900" />
      </div>
    </div>
  );
}

// 2. Export the parent component wrapped in Suspense to satisfy Next.js static rendering
export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailLoadingFallback />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
