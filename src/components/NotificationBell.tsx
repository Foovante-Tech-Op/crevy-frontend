"use client";

import { formatDistanceToNow } from "date-fns";
import { Bell } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  getNotificationIcon,
  getNotificationStyle,
} from "@/constants/notification-display";
import {
  useMarkNotificationRead,
  useNotifications,
  useUnreadNotificationCount,
} from "@/hooks/use-notifications";
import { cn } from "@/lib/utils";

const relativeTime = (iso: string) => {
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true });
  } catch {
    return "";
  }
};

/**
 * The header bell: unread dot plus a dropdown of the five most recent.
 *
 * The dot is driven by useUnreadNotificationCount (the one polled query in
 * the app). The list underneath is fetched lazily — `enabled: open` — so
 * every dashboard page load does not also pull five notifications nobody
 * asked to see.
 */
export function NotificationBell({ isActive }: { isActive?: boolean }) {
  const [open, setOpen] = useState(false);

  const { data: unreadCount = 0 } = useUnreadNotificationCount();
  const markRead = useMarkNotificationRead();

  const { data, isLoading } = useNotifications({ limit: 5, enabled: open });
  const recent = data?.data ?? [];

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={
            unreadCount > 0
              ? `Notifications, ${unreadCount} unread`
              : "Notifications"
          }
          className={cn(
            "relative rounded-none hover:text-slate-900 hover:bg-slate-50",
            isActive ? "text-slate-900" : "text-slate-400",
          )}
        >
          <Bell className="h-4 w-4" />
          {/* Only rendered when there is genuinely something unread. The dot
              this replaces was unconditional, so it always looked like the
              user had mail. */}
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-none bg-brand-500 px-1 font-mono text-[9px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-88 rounded-none border-slate-200 p-0"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
            Notifications
          </p>
          {unreadCount > 0 && (
            <span className="font-mono text-[10px] text-slate-400">
              {unreadCount} unread
            </span>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto">
          {isLoading && (
            <p className="px-4 py-8 text-center font-mono text-[10px] uppercase tracking-widest text-slate-400">
              Loading...
            </p>
          )}

          {!isLoading && recent.length === 0 && (
            <p className="px-4 py-8 text-center font-mono text-[10px] uppercase tracking-widest text-slate-400">
              Nothing yet
            </p>
          )}

          {!isLoading &&
            recent.map((n) => {
              const Icon = getNotificationIcon(n.type);
              const content = (
                <>
                  <span
                    className={cn(
                      "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-none border border-slate-100",
                      getNotificationStyle(n.type),
                    )}
                  >
                    <Icon size={14} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-start justify-between gap-2">
                      <span
                        className={cn(
                          "block truncate text-xs font-bold",
                          n.isRead ? "text-slate-600" : "text-slate-900",
                        )}
                      >
                        {n.title}
                      </span>
                      {!n.isRead && (
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-none bg-brand-500" />
                      )}
                    </span>
                    <span className="mt-0.5 block line-clamp-2 text-xs text-slate-500">
                      {n.content}
                    </span>
                    <span className="mt-1 block font-mono text-[9px] uppercase tracking-widest text-slate-300">
                      {relativeTime(n.createdAt)}
                    </span>
                  </span>
                </>
              );

              const rowClass = cn(
                "flex w-full gap-3 border-b border-slate-50 px-4 py-3 text-left transition-colors hover:bg-slate-50",
                !n.isRead && "bg-brand-50/30",
              );

              const onOpen = () => {
                if (!n.isRead) markRead.mutate(n.id);
              };

              return n.actionUrl ? (
                <Link
                  key={n.id}
                  href={n.actionUrl}
                  onClick={onOpen}
                  className={rowClass}
                >
                  {content}
                </Link>
              ) : (
                <button
                  key={n.id}
                  type="button"
                  onClick={onOpen}
                  className={rowClass}
                >
                  {content}
                </button>
              );
            })}
        </div>

        <Link
          href="/notifications"
          className="block border-t border-slate-100 px-4 py-3 text-center text-[10px] font-bold uppercase tracking-widest text-slate-500 transition-colors hover:text-slate-900"
        >
          View all →
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
