"use client";

import { Home, ListChecks, UserCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type React from "react";
import { cn } from "@/lib/utils";

// F1 — Field agent app shell.
// Deliberately minimal: no admin-style sidebar. Bottom tab bar on
// mobile/tablet widths (thumb-reachable), simple top nav on desktop.
// This is a SEPARATE shell from DashboardLayoutClient — field agents get
// a small, single-purpose interface, not the full admin dashboard.

const NAV_ITEMS = [
  { href: "/agent", label: "Home", icon: Home },
  { href: "/agent/registrations", label: "My Registrations", icon: ListChecks },
  { href: "/agent/profile", label: "Profile", icon: UserCircle },
];

export function AgentShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top bar — visible at all widths, doubles as nav on desktop */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/agent"
            className="font-sans font-bold text-lg text-slate-900"
          >
            Crevy{" "}
            <span className="text-slate-400 font-normal text-sm">Field</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-md transition-colors",
                    active
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-100",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-6 pb-24 md:pb-6">
        {children}
      </main>

      {/* Bottom tab bar — mobile/tablet only */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-slate-200 safe-area-inset-bottom">
        <div className="grid grid-cols-3">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 py-3 min-h-[56px] transition-colors",
                  active ? "text-slate-900" : "text-slate-400",
                )}
              >
                <Icon className="h-6 w-6" strokeWidth={active ? 2.5 : 2} />
                <span className="text-[11px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
