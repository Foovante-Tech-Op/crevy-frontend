"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  AccessDashboardButton,
  AccessDashboardMobileButton,
} from "@/components/DashboardTransitionLink";
import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth";
import { cn } from "@/lib/utils";

const getInitials = (name?: string) => {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.substring(0, 2).toUpperCase();
};

/**
 * Institutional Navbar Protocol
 * Enforces rigid typography, sharp borders, and high-contrast states.
 */
export function Navbar({ solid = false }: { solid?: boolean }) {
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Force solid background on specific institutional routes
  const forceSolid =
    solid ||
    pathname.startsWith("/marketplace") ||
    pathname.startsWith("/portfolio") ||
    pathname.startsWith("/about-us") ||
    pathname.startsWith("/methodology") ||
    pathname.startsWith("/support") ||
    pathname.startsWith("/privacy-policy") ||
    pathname.startsWith("/terms-of-service");

  const navLinks = [
    { name: "Marketplace", href: "/marketplace" },
    { name: "Methodology", href: "/methodology" },
    // { name: "About", href: "/about-us" },
    { name: "Support", href: "/support" },
  ];

  const isNavSolid = isScrolled || forceSolid;

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-colors duration-500",
        isNavSolid
          ? "bg-white border-b border-slate-200 py-4"
          : "bg-transparent py-6",
      )}
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 flex items-center justify-between">
        {/* ── Brand Identifier ── */}
        <NavLink
          href="/"
          className={cn(
            "font-bold text-3xl tracking-tight transition-colors",
            isNavSolid ? "text-slate-900" : "text-white",
            "hover:text-emerald-700",
          )}
        >
          Crevy.
        </NavLink>

        {/* ── Desktop Navigation ── */}
        <div className="hidden lg:flex items-center space-x-8">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              href={link.href}
              className={cn(
                "text-[10px] font-bold uppercase tracking-[0.2em] transition-colors relative group",
                isNavSolid
                  ? "text-slate-500 hover:text-slate-900"
                  : "text-white/70 hover:text-white",
              )}
            >
              {link.name}
              {/* Institutional Underline Hover */}
              <span
                className={cn(
                  "absolute -bottom-2 left-0 w-0 h-[2px] transition-all duration-300 group-hover:w-full",
                  isNavSolid ? "bg-slate-900" : "bg-white",
                )}
              ></span>
            </NavLink>
          ))}
        </div>

        {/* ── Desktop Auth Protocol ── */}
        <div className="hidden lg:flex items-center space-x-4">
          {isPending ? (
            <div
              className={cn(
                "flex items-center gap-2 px-4 py-2 border animate-pulse",
                isNavSolid
                  ? "bg-slate-50 border-slate-200"
                  : "bg-white/5 border-white/20 backdrop-blur-md",
              )}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" />
              <span
                className={cn(
                  "text-[10px] font-mono font-bold uppercase tracking-widest",
                  isNavSolid ? "text-slate-400" : "text-white/40",
                )}
              >
                Authenticating...
              </span>
            </div>
          ) : user ? (
            <div className="flex items-center gap-4">
              {/* Sharp Identity Block */}
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2 border transition-colors",
                  isNavSolid
                    ? "bg-slate-50 border-slate-200"
                    : "bg-white/5 border-white/20 backdrop-blur-md",
                )}
              >
                <div
                  className={cn(
                    "w-6 h-6 flex items-center justify-center text-[11px] font-bold",
                    isNavSolid
                      ? "bg-slate-900 text-white"
                      : "bg-white text-slate-900",
                  )}
                >
                  {getInitials(user.name)}
                </div>
                {/* <span
                  className={cn(
                    "text-[10px] font-mono font-bold uppercase tracking-widest",
                    isNavSolid ? "text-slate-900" : "text-white",
                  )}
                >
                   {user.name.split(" ")} 
                </span> */}
              </div>

              <AccessDashboardButton isNavSolid={isNavSolid} />
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className={cn(
                  "text-[10px] font-bold uppercase tracking-widest transition-colors px-4 py-2",
                  isNavSolid
                    ? "text-slate-600 hover:text-slate-900"
                    : "text-white/80 hover:text-white",
                )}
              >
                Login
              </Link>
              <Button
                asChild
                className={cn(
                  "rounded-none font-bold uppercase tracking-widest text-[10px] px-8 h-10 transition-colors",
                  isNavSolid
                    ? "bg-slate-900 hover:bg-brand text-white"
                    : "bg-white hover:bg-brand text-slate-900 hover:text-white",
                )}
              >
                <Link href="/register">Sign Up</Link>
              </Button>
            </>
          )}
        </div>

        {/* ── Mobile Menu Toggle ── */}
        <button
          type="button"
          className={cn(
            "lg:hidden transition-colors",
            isNavSolid ? "text-slate-900" : "text-white",
          )}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle Navigation"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* ── Mobile Navigation Drawer ── */}
      <AnimatePresence mode="wait">
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-0 top-0 left-0 h-screen w-full bg-foreground z-50 flex flex-col p-6 lg:hidden overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-16 border-b border-slate-800 pb-6">
              <span className="font-bold text-2xl text-white">Crevy.</span>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
                aria-label="Close menu"
              >
                <X size={24} />
              </button>
            </div>

            <nav className="flex flex-col space-y-0 text-left border-t border-slate-800">
              {navLinks.map((link) => (
                <NavLink
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="py-6 border-b border-slate-800 text-sm font-bold uppercase tracking-[0.2em] text-slate-300 hover:text-emerald-500 transition-colors flex justify-between items-center"
                >
                  {link.name}
                  <span className="text-slate-700 font-mono text-[10px]">
                    +
                  </span>
                </NavLink>
              ))}
            </nav>

            <div className="mt-auto pt-12 flex flex-col space-y-4">
              {isPending ? (
                <div className="bg-slate-900 border border-slate-800 p-6 flex flex-col items-center gap-4 animate-pulse">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" />
                  <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-white/40">
                    Verifying Identity...
                  </span>
                </div>
              ) : user ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 p-4">
                    <div className="w-10 h-10 bg-white text-slate-900 flex items-center justify-center text-lg font-bold shrink-0">
                      {getInitials(user.name)}
                    </div>
                    <div className="text-left overflow-hidden">
                      <p className="text-white font-bold truncate">
                        {user.name}
                      </p>
                      <p className="text-slate-500 font-mono text-[10px] uppercase tracking-widest truncate mt-1">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <AccessDashboardMobileButton
                    onMenuClose={() => setIsMobileMenuOpen(false)}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    asChild
                    variant="outline"
                    className="rounded-none border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white font-bold uppercase tracking-widest text-[10px] h-12"
                  >
                    <Link
                      href="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Login
                    </Link>
                  </Button>
                  <Button
                    asChild
                    className="rounded-none bg-brand hover:bg-brand text-white font-bold uppercase tracking-widest text-[10px] h-12"
                  >
                    <Link
                      href="/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
