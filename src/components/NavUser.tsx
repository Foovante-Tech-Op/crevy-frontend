"use client";

import {
  BadgeCheck,
  ChevronsUpDown,
  Loader2,
  LogOut,
  UserCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth";
import { getErrorMessage } from "@/lib/errors";
import { getDisplayName, getUserInitials } from "@/lib/utils";
import type { TBetterAuthUser } from "@/types";

export const NavUser = ({ user }: { user: TBetterAuthUser | null }) => {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const avatarUrl = user?.image ?? user?.avatar;

  const handleLogOut = async () => {
    try {
      setLoading(true);
      await authClient.signOut();
      router.push("/login");
    } catch (error) {
      toast.error(
        getErrorMessage(error, "We couldn't sign you out. Please try again."),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="bg-transparent hover:bg-white/10 text-white data-[state=open]:bg-white/10 rounded-none border-l-2 border-transparent transition-all group-data-[collapsible=icon]:!p-2"
            >
              {loading ? (
                <div className="flex items-center justify-center w-full">
                  <Loader2 className="h-4 w-4 animate-spin text-white/50" />
                </div>
              ) : (
                <>
                  <Avatar className="h-8 w-8 rounded-none border border-white/20">
                    <AvatarImage
                      src={avatarUrl}
                      alt={getDisplayName(user)}
                      className="object-cover"
                    />
                    <AvatarFallback className="rounded-none bg-foreground text-white font-mono text-[10px]">
                      {getUserInitials(user)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-white">
                      {user?.role?.replace("_", " ")}
                    </span>
                    <span className="truncate font-serif text-white text-base">
                      {getDisplayName(user)}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto h-4 w-4 text-white/40 group-data-[collapsible=icon]:hidden" />
                </>
              )}
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-none border border-slate-200 shadow-2xl font-mono uppercase tracking-widest text-[10px]"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={16}
          >
            <DropdownMenuLabel className="p-0 font-normal border-b border-slate-100 mb-1">
              <div className="flex items-center gap-3 px-4 py-3 text-left">
                <Avatar className="h-10 w-10 rounded-none border border-slate-200">
                  <AvatarImage
                    src={avatarUrl}
                    alt={getDisplayName(user)}
                    className="object-cover"
                  />
                  <AvatarFallback className="rounded-none bg-slate-900 text-white font-mono text-[10px]">
                    {getUserInitials(user)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate font-bold text-slate-900 font-sans text-sm">
                    {getDisplayName(user)}
                  </span>
                  <span className="truncate text-[9px] text-slate-400 lowercase tracking-normal font-sans">
                    {user?.email || ""}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuGroup className="p-1">
              <DropdownMenuItem
                onClick={() => router.push("/profile")}
                className="cursor-pointer focus:bg-slate-50 focus:text-slate-900 py-2.5"
              >
                <UserCircle className="h-4 w-4 mr-3 text-slate-400" />
                My Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push("/settings")}
                className="cursor-pointer focus:bg-slate-50 focus:text-slate-900 py-2.5"
              >
                <BadgeCheck className="h-4 w-4 mr-3 text-slate-400" />
                System Settings
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator className="bg-slate-100" />

            <div className="p-1">
              <DropdownMenuItem
                onClick={handleLogOut}
                disabled={loading}
                className="cursor-pointer focus:bg-red-50 focus:text-red-600 text-slate-500 py-2.5"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-3" />
                ) : (
                  <LogOut className="h-4 w-4 mr-3" />
                )}
                Logout
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};
