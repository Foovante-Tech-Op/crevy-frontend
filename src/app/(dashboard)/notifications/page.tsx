"use client";

import { formatDistanceToNow } from "date-fns";
import { AlertTriangle, Bell, ChevronRight, Clock } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getNotificationIcon,
  getNotificationStyle,
  NOTIFICATION_FILTERS,
  type TNotificationFilterValue,
} from "@/constants/notification-display";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "@/hooks/use-notifications";
import type {
  TNotification,
  TNotificationType,
} from "@/types/notification.types";

const PAGE_SIZE = 20;

/**
 * Turns a filter chip into query params.
 *
 * The chips drive the REQUEST, not a client-side .filter() over whatever
 * happened to be on the current page — otherwise "Unread" would only ever
 * show the unread items among the most recent 20.
 */
const filterToParams = (filter: TNotificationFilterValue) => {
  if (filter === "all") return {};
  if (filter === "unread") return { unreadOnly: true };
  return { type: filter as TNotificationType };
};

const relativeTime = (iso: string) => {
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true });
  } catch {
    return "";
  }
};

export default function NotificationsPage() {
  const [filter, setFilter] = useState<TNotificationFilterValue>("all");
  const [limit, setLimit] = useState(PAGE_SIZE);

  const { data, isLoading, isError } = useNotifications({
    ...filterToParams(filter),
    limit,
  });

  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const notifications = data?.data ?? [];
  const total = data?.total ?? 0;
  const unreadCount = data?.unreadCount ?? 0;

  const selectFilter = (value: TNotificationFilterValue) => {
    setFilter(value);
    setLimit(PAGE_SIZE);
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-slate-200 pb-12">
        <div className="max-w-2xl">
          <p className="text-brand-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
            <Bell size={14} /> Institutional Alert Registry
          </p>
          <h1 className="text-5xl font-black text-slate-900 leading-[1.1] tracking-tighter uppercase italic">
            Command <br /> Center Notifications
          </h1>
        </div>
      </div>

      <div className="space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {NOTIFICATION_FILTERS.map((t) => (
              <button
                type="button"
                key={t.value}
                onClick={() => selectFilter(t.value)}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  filter === t.value
                    ? "bg-slate-900 text-white shadow-lg"
                    : "bg-white border border-slate-200 text-slate-400 hover:border-slate-900 hover:text-slate-900"
                }`}
              >
                {t.label}
                {t.value === "unread" && unreadCount > 0
                  ? ` (${unreadCount})`
                  : ""}
              </button>
            ))}
          </div>
          <Button
            variant="ghost"
            onClick={() => markAllRead.mutate()}
            disabled={unreadCount === 0 || markAllRead.isPending}
            className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-brand-600 disabled:opacity-40"
          >
            {markAllRead.isPending ? "Marking..." : "Mark all as read"}
          </Button>
        </div>

        {/*
          An error must never look like an empty inbox. "No notifications"
          when the API is down tells the user nothing has happened, which on a
          registry is the opposite of the truth. Same distinction the super
          admin dashboard draws between unavailable and zero.
        */}
        {isError && (
          <div className="flex items-start gap-4 p-6 rounded-[2rem] border border-amber-200 bg-amber-50">
            <AlertTriangle className="text-amber-500 shrink-0" size={20} />
            <div>
              <p className="font-black uppercase tracking-tight text-amber-900 text-sm">
                Notifications could not be loaded
              </p>
              <p className="text-amber-700 text-sm font-medium mt-1">
                This is not an empty inbox — we couldn't reach the server.
                Refresh to try again.
              </p>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="space-y-4">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="p-8 rounded-[2rem] border border-slate-100 bg-white flex gap-8 items-start"
              >
                <Skeleton className="w-14 h-14 rounded-2xl shrink-0" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && !isError && notifications.length === 0 && (
          <div className="py-20 text-center border border-dashed border-slate-200 rounded-[2rem] bg-slate-50/60">
            <Bell className="mx-auto text-slate-300 mb-4" size={32} />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
              {filter === "all" ? "No notifications yet" : "Nothing here"}
            </p>
            <p className="text-slate-400 text-sm font-medium mt-3 max-w-sm mx-auto leading-relaxed">
              {filter === "all"
                ? "Project updates, verification results and payout events will appear here."
                : "No notifications match this filter."}
            </p>
          </div>
        )}

        {!isLoading && !isError && notifications.length > 0 && (
          <div className="space-y-4">
            {notifications.map((n) => (
              <NotificationRow
                key={n.id}
                notification={n}
                onOpen={() => {
                  if (!n.isRead) markRead.mutate(n.id);
                }}
              />
            ))}
          </div>
        )}

        {!isLoading && !isError && total > notifications.length && (
          <div className="text-center">
            <Button
              variant="ghost"
              onClick={() => setLimit((l) => l + PAGE_SIZE)}
              className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900"
            >
              Load more ({notifications.length} of {total})
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function NotificationRow({
  notification: n,
  onOpen,
}: {
  notification: TNotification;
  onOpen: () => void;
}) {
  const Icon = getNotificationIcon(n.type);
  const iconStyle = getNotificationStyle(n.type);

  const body = (
    <>
      <div
        className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-slate-50 ${iconStyle}`}
      >
        <Icon size={28} />
      </div>

      <div className="flex-1 space-y-2 min-w-0">
        <div className="flex justify-between items-start gap-4">
          <h3
            className={`font-black uppercase tracking-tight text-lg ${
              n.isRead ? "text-slate-700" : "text-slate-900"
            }`}
          >
            {n.title}
          </h3>
          {!n.isRead && (
            <span className="mt-2 w-2 h-2 shrink-0 rounded-full bg-brand-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          )}
        </div>
        <p className="text-slate-500 font-medium leading-relaxed">
          {n.content}
        </p>
        <div className="pt-4 flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-slate-300">
          <span className="flex items-center gap-2">
            <Clock size={12} /> {relativeTime(n.createdAt)}
          </span>
          {/* Rendered only when there is somewhere real to go. The mock showed
              this affordance on every row and it led nowhere. */}
          {n.actionUrl && (
            <span className="flex items-center gap-2 group-hover:text-slate-900 transition-colors">
              Details <ChevronRight size={12} />
            </span>
          )}
        </div>
      </div>
    </>
  );

  const className = `group p-8 rounded-[2rem] border transition-all flex gap-8 items-start hover:shadow-xl ${
    n.isRead
      ? "bg-white border-slate-100"
      : "bg-white border-brand-200 shadow-lg shadow-brand-900/5 ring-1 ring-brand-100"
  }`;

  if (n.actionUrl) {
    return (
      <Link href={n.actionUrl} onClick={onOpen} className={className}>
        {body}
      </Link>
    );
  }

  // No destination: still clickable to mark read, but it is a button, not a
  // link pretending to go somewhere.
  return (
    <button
      type="button"
      onClick={onOpen}
      className={`${className} text-left w-full`}
    >
      {body}
    </button>
  );
}
