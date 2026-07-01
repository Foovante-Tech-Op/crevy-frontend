"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

interface NavLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

/**
 * NavLink — wraps Next.js <Link> with CrevyLoader transition.
 *
 * When clicked, it:
 * 1. Calls the onClick handler (e.g. close mobile menu)
 * 2. Shows the CrevyLoader via the global loader ref
 * 3. Navigates after a brief delay so the loader animation starts
 */
export function NavLink({ href, children, className, onClick }: NavLinkProps) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onClick?.();

    // Trigger global loader if available
    if (typeof window !== "undefined" && (window as any).__showCrevyLoader) {
      (window as any).__showCrevyLoader();
    }

    // Navigate after a brief delay so the loader starts animating
    setTimeout(() => {
      router.push(href);
    }, 100);
  };

  return (
    <Link href={href} className={className} onClick={handleClick}>
      {children}
    </Link>
  );
}
