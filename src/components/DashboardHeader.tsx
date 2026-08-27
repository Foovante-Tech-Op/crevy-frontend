"use client";

import { Command, Search, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NotificationBell } from "@/components/NotificationBell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useCommandPalette } from "@/context/CommandPaletteContext";
import { cn, getFirstName, getUserInitials } from "@/lib/utils";
import type { TBetterAuthUser } from "@/types";

interface DashboardHeaderProps {
  user?: TBetterAuthUser | null;
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const pathname = usePathname();
  const palette = useCommandPalette();

  const isOn = (href: string) => pathname === href;

  // Generate a sophisticated breadcrumb/context based on the route
  const getContext = () => {
    if (pathname === "/dashboard") return "Executive Overview";
    const path = pathname.split("/").filter(Boolean)[0];
    return path ? path.replace("-", " ") : "Terminal";
  };

  return (
    <div className="flex items-center justify-between py-4 bg-transparent px-6 lg:px-12">
      {/* ── Left: Context & Greeting ── */}
      <div className="flex items-center gap-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">
            System Context / {getContext()}
          </p>
          <h1 className="text-xl font-serif text-slate-900 leading-none">
            Welcome, {getFirstName(user)}.
          </h1>
        </div>
      </div>

      {/* ── Right: Utilities & Profile ── */}
      <div className="flex items-center gap-4">
        {/* This was styled to advertise ⌘K and had no onClick — the shortcut
            it promised did not exist either. Both are real now; the keyboard
            handler lives in CommandPaletteProvider so it also works on the
            routes where this header is hidden. */}
        <button
          type="button"
          onClick={() => palette?.setOpen(true)}
          className="hidden md:flex items-center gap-12 px-4 py-2 border border-slate-200 bg-white text-slate-400 hover:text-slate-900 transition-colors group"
        >
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">
              Global Search
            </span>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-mono group-hover:text-slate-900">
            <Command className="w-3 h-3" /> K
          </div>
        </button>

        <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
          {/* Both of these were bare <Button>s with no handler and no href —
              they rendered a hover state and did nothing on click. The pages
              they belong to already existed and were only reachable from the
              sidebar. The bell now carries a live unread count and a preview
              dropdown; the badge it shows is real data, not a constant. */}
          <NotificationBell isActive={isOn("/notifications")} />

          <Button
            asChild
            variant="ghost"
            size="icon"
            className={cn(
              "rounded-none hover:text-slate-900 hover:bg-slate-50",
              isOn("/settings") ? "text-slate-900" : "text-slate-400",
            )}
          >
            <Link href="/settings" aria-label="Settings">
              <Settings className="h-4 w-4" />
            </Link>
          </Button>

          <Avatar className="h-9 w-9 rounded-none border border-slate-200 ml-2">
            <AvatarImage
              src={user?.image || user?.avatar}
              alt={user?.name}
              className="object-cover"
            />
            <AvatarFallback className="rounded-none bg-slate-900 text-white font-mono text-[10px]">
              {getUserInitials(user)}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
  );
}
