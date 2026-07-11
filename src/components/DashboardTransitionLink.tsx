"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { LayoutDashboard } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTransition } from "@/context/TransitionContext";
import { cn } from "@/lib/utils";

/**
 * CrevyTransitionLoader
 * Fullscreen transition overlay shown while navigating to the dashboard.
 * Counts to 100% then calls onComplete to trigger route navigation.
 */
function CrevyTransitionLoader() {
  const [progress, setProgress] = useState(0);
  const shouldReduceMotion = useReducedMotion();
  const { isTransitioning } = useTransition();

  useEffect(() => {
    if (!isTransitioning) return;

    const timer = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 100 : prev + 3));
    }, 16);
    return () => clearInterval(timer);
  }, [isTransitioning]);

  return (
    <motion.div
      className="fixed inset-0 z-[9999] bg-foreground flex flex-col items-center justify-center overflow-hidden"
      exit={shouldReduceMotion ? { opacity: 0 } : { y: "-100%" }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Architectural guide lines */}
      <div className="absolute inset-0 flex justify-center pointer-events-none">
        <div className="w-px h-full bg-slate-800/50" />
        <div className="w-px h-full bg-slate-800/50 mx-[25vw]" />
        <div className="w-px h-full bg-slate-800/50 mx-[25vw]" />
      </div>

      {/* Wordmark */}
      <motion.h1
        initial={shouldReduceMotion ? { opacity: 0 } : { y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={
          shouldReduceMotion
            ? { duration: 0.2 }
            : { type: "spring", damping: 28, stiffness: 90 }
        }
        className="font-sans text-5xl md:text-7xl text-white tracking-tight relative z-10"
      >
        Crevy
      </motion.h1>

      {/* Status line */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="absolute top-1/2 mt-16 font-mono text-[10px] text-slate-500 uppercase tracking-[0.3em]"
      >
        {progress < 100
          ? "Initializing Secure Terminal..."
          : "Loading Dashboard..."}
      </motion.p>

      {/* Progress bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute bottom-16 w-48 flex flex-col items-center gap-3"
      >
        <div className="w-full h-px bg-slate-800 relative overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 bg-brand"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-brand" />
          <span className="font-mono text-[10px] text-slate-400 tracking-[0.3em] uppercase tabular-nums">
            {progress}%
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}

/**
 * DashboardTransitionLink
 * Drop-in replacement for <Link href="/dashboard">.
 * Shows the Crevy transition overlay then navigates once the animation
 * completes — so the user never stares at a blank public page waiting for
 * the dashboard SSR to resolve.
 */
export function DashboardTransitionLink({
  className,
  children,
  onClick: externalOnClick,
}: {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  const router = useRouter();
  const { isTransitioning, startTransition } = useTransition();

  const handleClick = () => {
    // Fire any external handler (e.g. close mobile menu)
    externalOnClick?.();
    startTransition(); // Start the transition via context
    router.push("/dashboard"); // Immediately navigate
  };

  return (
    <>
      <AnimatePresence>
        {isTransitioning && <CrevyTransitionLoader />}
      </AnimatePresence>
      <button type="button" className={className} onClick={handleClick}>
        {children}
      </button>
    </>
  );
}

/**
 * Pre-built desktop "Access Dashboard" button — matches Navbar styling exactly.
 */
export function AccessDashboardButton({ isNavSolid }: { isNavSolid: boolean }) {
  return (
    <DashboardTransitionLink
      className={cn(
        "inline-flex items-center rounded-none font-bold uppercase tracking-widest text-[10px] px-6 h-10 transition-colors",
        isNavSolid
          ? "bg-slate-900 hover:bg-emerald-900 text-white"
          : "bg-white hover:bg-brand text-slate-900 hover:text-white",
      )}
    >
      Access Dashboard <LayoutDashboard className="w-3.5 h-3.5 ml-2" />
    </DashboardTransitionLink>
  );
}

/**
 * Pre-built mobile "Access Dashboard" button — matches Navbar mobile styling.
 */
export function AccessDashboardMobileButton({
  onMenuClose,
}: {
  onMenuClose: () => void;
}) {
  return (
    <DashboardTransitionLink
      className="w-full inline-flex items-center justify-center rounded-none bg-brand hover:bg-brand/70 text-white font-bold uppercase tracking-widest text-[10px] h-12 transition-colors"
      onClick={onMenuClose}
    >
      Access Dashboard <LayoutDashboard className="w-4 h-4 ml-2" />
    </DashboardTransitionLink>
  );
}
