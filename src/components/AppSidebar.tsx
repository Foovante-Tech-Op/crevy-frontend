"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { getSidebarConfig } from "@/constants/sidebar-items";
import type { TBetterAuthUser } from "@/types";
import { NavUser } from "./NavUser";
import { Separator } from "./ui/separator";

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: TBetterAuthUser & { activeOrganizationId?: string };
}) {
  const pathname = usePathname();
  const { setOpenMobile, isMobile, state, toggleSidebar } = useSidebar();

  const role = user.role || "project_owner";
  const sidebarConfig = getSidebarConfig(role);

  // Dynamic Theme Matrix based on Tier Clearance
  const getSidebarStyles = (r: string) => {
    if (r === "super_admin") {
      return {
        bg: "bg-foreground",
        active: "bg-background text-foreground font-medium",
        inactive:
          "border-transparent text-slate-400 hover:bg-white/5 hover:text-white",
        label: "text-slate-500",
        dot: "text-white",
      };
    }

    if (r === "admin") {
      return {
        bg: "bg-foreground/80",
        active:
          "bg-brand/70 text-foreground font-bold border-brand/70 hover:bg-brand hover:text-foreground",
        inactive:
          "border-transparent text-slate-400 hover:bg-brand/5 hover:text-brand",
        label: "text-slate-500",
        dot: "text-brand",
      };
    }

    // Buyers / Climate Asset Allocators (Low-contrast brand-infused dark palette)
    return {
      bg: "bg-brand/85",
      active:
        "bg-foreground/90 text-white border-foreground font-bold hover:bg-foreground hover:text-background/50",
      inactive:
        "border-transparent text-foreground hover:bg-foreground/50 hover:text-white",
      label: "text-background font-mono tracking-[0.25em]",
      dot: "text-foreground",
    };
  };

  const currentStyle = getSidebarStyles(role);

  return (
    <Sidebar
      {...props}
      className={`border-r-0 h-full ${currentStyle.bg} selection:bg-brand selection:text-slate-900`}
      collapsible="icon"
    >
      <SidebarHeader className="pt-6 pb-4 shrink-0">
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center gap-3 overflow-hidden">
            <Link
              href="/"
              className="text-2xl font-bold text-white tracking-tight group-data-[collapsible=icon]:hidden"
            >
              Crevy<span className={currentStyle.dot}>.</span>
            </Link>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="hidden md:flex text-white/50 hover:text-white hover:bg-white/10 rounded-none shrink-0"
          >
            {state === "expanded" ? (
              <PanelLeftClose size={18} />
            ) : (
              <PanelLeftOpen size={18} />
            )}
          </Button>

          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpenMobile(false)}
              className="text-white hover:bg-white/10 rounded-none shrink-0"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>

        <div className="px-5 mt-4 group-data-[collapsible=icon]:hidden">
          <Separator
            orientation="horizontal"
            className="border-b border-white/10"
          />
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 overflow-y-auto" data-lenis-prevent>
        {/* ── Top Primary Items ── */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarConfig.topItems.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      className={`
                        flex items-center gap-4 px-3 py-5 rounded-none transition-all border-l-2
                        ${isActive ? currentStyle.active : currentStyle.inactive}
                      `}
                    >
                      <Link href={item.url}>
                        <HugeiconsIcon
                          icon={item.icon}
                          size={24}
                          color="currentColor"
                          strokeWidth={1.5}
                          className="shrink-0"
                        />
                        <span className="text-xs font-mono tracking-[0.15em] uppercase group-data-[collapsible=icon]:hidden">
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* ── Section Group Closures ── */}
        {sidebarConfig.sections?.map((section, sectionIndex) => (
          <SidebarGroup key={section.title || sectionIndex} className="mt-4">
            {section.title && (
              <SidebarGroupLabel
                className={`px-4 text-[9px] font-bold uppercase tracking-[0.2em] mb-2 group-data-[collapsible=icon]:hidden ${currentStyle.label}`}
              >
                {section.title}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => {
                  const isActive = pathname === item.url;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        tooltip={item.title}
                        className={`
                          flex items-center gap-4 px-3 py-5 rounded-none transition-all border-l-2
                          ${isActive ? currentStyle.active : currentStyle.inactive}
                        `}
                      >
                        <Link href={item.url}>
                          <HugeiconsIcon
                            icon={item.icon}
                            size={24}
                            color="currentColor"
                            strokeWidth={1.5}
                            className="shrink-0"
                          />
                          <span className="text-xs font-mono tracking-[0.15em] uppercase group-data-[collapsible=icon]:hidden">
                            {item.title}
                          </span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="mt-auto p-4 border-t border-white/5 shrink-0 rounded-none">
        <NavUser user={user} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
