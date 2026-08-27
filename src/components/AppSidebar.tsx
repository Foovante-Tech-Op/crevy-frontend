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
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { getSidebarConfig } from "@/constants/sidebar-items";
import { useUnreadNotificationCount } from "@/hooks/use-notifications";
import type { TBetterAuthUser } from "@/types";
import type { SidebarItem } from "@/types/sidebar.types";
import { NavUser } from "./NavUser";
import { Separator } from "./ui/separator";

/**
 * One nav row, used by both the top items and the grouped sections — they
 * rendered identical markup in two places before, so a badge added to one
 * would silently not appear in the other.
 *
 * `badge` is live data passed down from AppSidebar, not a property of the
 * static config. sidebar-items.ts used to carry a hardcoded `badge: 3` that
 * nothing rendered; SidebarMenuBadge existed here and had no consumers.
 */
function NavItem({
  item,
  className,
  badge,
}: {
  item: SidebarItem;
  className: string;
  badge?: number;
}) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild tooltip={item.title} className={className}>
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
      {/* Rendered only when there is something to count — a "0" badge is
          noise, and an always-on badge is a lie. */}
      {badge !== undefined && badge > 0 && (
        <SidebarMenuBadge className="group-data-[collapsible=icon]:hidden bg-brand-500 text-white font-mono text-[10px] rounded-none px-1.5 min-w-5 justify-center">
          {badge > 99 ? "99+" : badge}
        </SidebarMenuBadge>
      )}
    </SidebarMenuItem>
  );
}

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: TBetterAuthUser & { activeOrganizationId?: string };
}) {
  const pathname = usePathname();
  const { setOpenMobile, isMobile, state, toggleSidebar } = useSidebar();

  const role = user.role || "project_developer";
  const sidebarConfig = getSidebarConfig(role);

  const { data: unreadNotifications = 0 } = useUnreadNotificationCount();

  // The only badged item today. Keyed on url rather than title so a rename
  // of the label cannot silently drop the badge.
  const badgeFor = (item: SidebarItem) =>
    item.url === "/notifications" ? unreadNotifications : undefined;

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
                  <NavItem
                    key={item.title}
                    item={item}
                    badge={badgeFor(item)}
                    className={`
                        flex items-center gap-4 px-3 py-5 rounded-none transition-all border-l-2
                        ${isActive ? currentStyle.active : currentStyle.inactive}
                      `}
                  />
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
                    <NavItem
                      key={item.title}
                      item={item}
                      badge={badgeFor(item)}
                      className={`
                          flex items-center gap-4 px-3 py-5 rounded-none transition-all border-l-2
                          ${isActive ? currentStyle.active : currentStyle.inactive}
                        `}
                    />
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
