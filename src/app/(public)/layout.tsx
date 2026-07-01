"use client";

import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { CrevyLoader } from "@/components/CrevyLoader";
import { Navbar } from "@/components/public/landing/Navbar";
import { PublicFooter } from "@/components/public/public-footer";

/**
 * PublicLayout
 *
 * Loader strategy:
 *   - On first paint: show loader, reveal content only on complete.
 *   - On every pathname change (Next.js route transition): show loader again.
 *   - On Navbar NavLink clicks: the NavLink calls window.__showCrevyLoader
 *     before router.push, so the loader fires before React even starts
 *     rendering the new route — this is the "click" trigger.
 *
 * The Navbar is always mounted (fixed position, z-50) so it doesn't
 * flash in/out around the loader. The loader sits above it at z-[100].
 * The main content is gated behind isLoading to prevent a flash of the
 * old page while the loader plays.
 */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const isInitialMount = useRef(true);

  // Route-change trigger — fires when Next.js completes navigation
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    setIsLoading(true);
  }, []);

  // Global imperative trigger — called by NavLink before router.push
  // so the loader starts immediately on click, not after React finishes
  // the route transition.
  useEffect(() => {
    (window as any).__showCrevyLoader = () => setIsLoading(true);
    return () => {
      delete (window as any).__showCrevyLoader;
    };
  }, []);

  const handleLoaderComplete = useCallback(() => {
    setIsLoading(false);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Loader overlays everything at z-[100] — Navbar stays mounted beneath */}
      {isLoading && <CrevyLoader onComplete={handleLoaderComplete} />}

      {/* Navbar is always rendered so it doesn't flash on loader exit */}
      <Navbar />

      {/* Content gated until loader finishes */}
      {!isLoading && <main className="flex-1">{children}</main>}
      {!isLoading && <PublicFooter />}
    </div>
  );
}
