"use client";

import { Bell, Command, Search, Settings } from "lucide-react";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getFirstName, getUserInitials } from "@/lib/utils";
import type { TBetterAuthUser } from "@/types";

interface DashboardHeaderProps {
  user?: TBetterAuthUser | null;
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const pathname = usePathname();

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
        {/* Command Search Simulation */}
        <button
          type="button"
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
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-none text-slate-400 hover:text-slate-900 hover:bg-slate-50"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="rounded-none text-slate-400 hover:text-slate-900 hover:bg-slate-50"
          >
            <Settings className="h-4 w-4" />
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
