"use client";

import { formatDistanceToNow } from "date-fns";
import { AlertTriangle, ChevronRight, Clock } from "lucide-react";
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
    <div className="max-w-[1400px] mx-auto py-12 px-6 lg:px-10 font-sans animate-in fade-in duration-700 pb-24">
      {/* ── Editorial Header — matches settings/organizations ── */}
      <div className="border-b border-slate-200 pb-12 mb-12">
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="w-6 h-[1px] bg-slate-900"></div>
          <span className="text-slate-900 text-[10px] font-bold uppercase tracking-[0.2em]">
            Account Activity
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-sans text-slate-900 tracking-tight leading-none mb-4">
          Notification <span className="italic text-brand">Registry.</span>
        </h1>
        <p className="text-slate-500 text-sm max-w-xl leading-relaxed">
          Project updates, verification results, payout events and access
          changes recorded against your account.
        </p>
      </div>

      {/* Constrained inside the standard page width so lines stay readable
          without breaking the app's outer rhythm. */}
      <div className="max-w-4xl space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {NOTIFICATION_FILTERS.map((t) => (
              <button
                type="button"
                key={t.value}
                onClick={() => selectFilter(t.value)}
                className={`px-5 py-2 rounded-none text-[10px] font-bold uppercase tracking-widest transition-colors border ${
                  filter === t.value
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white border-slate-200 text-slate-400 hover:border-slate-900 hover:text-slate-900"
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
            className="rounded-none text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-brand-600 disabled:opacity-40"
          >
            {markAllRead.isPending ? "Marking..." : "Mark all as read"}
          </Button>
        </div>

        {/*
          An error must never look like an empty inbox. "No notifications"
          when the API is down tells the user nothing has happened, which on a
          registry is the opposite of the truth.
        */}
        {isError && (
          <div className="flex items-start gap-4 p-6 rounded-none border border-amber-200 bg-amber-50">
            <AlertTriangle className="text-amber-500 shrink-0" size={18} />
            <div>
              <p className="text-sm font-bold text-amber-900">
                Notifications could not be loaded
              </p>
              <p className="text-amber-700 text-xs font-mono mt-1 leading-relaxed">
                This is not an empty inbox — we couldn't reach the server.
                Refresh to try again.
              </p>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="border border-slate-200 bg-white rounded-none divide-y divide-slate-100">
            {[0, 1, 2].map((i) => (
              <div key={i} className="p-6 flex gap-5 items-start">
                <Skeleton className="w-10 h-10 rounded-none shrink-0" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-4 w-1/3 rounded-none" />
                  <Skeleton className="h-3 w-3/4 rounded-none" />
                  <Skeleton className="h-3 w-24 rounded-none" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && !isError && notifications.length === 0 && (
          <div className="py-20 text-center border border-dashed border-slate-200 rounded-none bg-slate-50">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
              {filter === "all" ? "No notifications yet" : "Nothing here"}
            </p>
            <p className="text-slate-400 text-xs font-mono mt-3 max-w-sm mx-auto leading-relaxed">
              {filter === "all"
                ? "Project updates, verification results and payout events will appear here."
                : "No notifications match this filter."}
            </p>
          </div>
        )}

        {!isLoading && !isError && notifications.length > 0 && (
          <div className="border border-slate-200 bg-white rounded-none divide-y divide-slate-100">
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
              className="rounded-none text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900"
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
        className={`w-10 h-10 rounded-none flex items-center justify-center shrink-0 border border-slate-100 ${iconStyle}`}
      >
        <Icon size={18} />
      </div>

      <div className="flex-1 space-y-1.5 min-w-0">
        <div className="flex justify-between items-start gap-4">
          <h3
            className={`text-sm font-bold tracking-tight ${
              n.isRead ? "text-slate-600" : "text-slate-900"
            }`}
          >
            {n.title}
          </h3>
          {!n.isRead && (
            <span className="mt-1.5 w-2 h-2 shrink-0 rounded-none bg-brand-500" />
          )}
        </div>
        <p className="text-slate-500 text-sm leading-relaxed">{n.content}</p>
        <div className="pt-3 flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest text-slate-300">
          <span className="flex items-center gap-2 font-mono normal-case tracking-wide">
            <Clock size={12} /> {relativeTime(n.createdAt)}
          </span>
          {/* Rendered only when there is somewhere real to go. The mock showed
              this affordance on every row and it led nowhere. */}
          {n.actionUrl && (
            <span className="flex items-center gap-1 group-hover:text-slate-900 transition-colors">
              Details <ChevronRight size={12} />
            </span>
          )}
        </div>
      </div>
    </>
  );

  const className = `group p-6 transition-colors flex gap-5 items-start hover:bg-slate-50 ${
    n.isRead ? "" : "bg-brand-50/30"
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
