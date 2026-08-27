"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errors";
import { NotificationService } from "@/lib/services/notification-service";
import type {
  TNotificationFilters,
  TNotificationListResponse,
} from "@/types/notification.types";

/** Everything under this key is invalidated together after a read/unread write. */
const NOTIFICATIONS_KEY = ["notifications"] as const;

/**
 * `enabled` is a hook-level concern, not a request filter, so it is stripped
 * before the key is built — otherwise the bell dropdown (enabled: true once
 * opened) and any other caller with the same filters would cache separately.
 */
export function useNotifications({
  enabled = true,
  ...filters
}: TNotificationFilters & { enabled?: boolean } = {}) {
  return useQuery<TNotificationListResponse>({
    queryKey: [...NOTIFICATIONS_KEY, "list", filters],
    queryFn: () => NotificationService.list(filters),
    enabled,
  });
}

/**
 * The bell badge.
 *
 * This is the ONLY polled query in the app. Keep it that way: the list query
 * above must not poll, or every open dashboard tab re-fetches a full page of
 * notifications every minute for a number it already has here.
 *
 * Polling rather than SSE is a deliberate choice — long-lived connections
 * through the Next rewrite proxy and Cloudflare are fragile, and the backend
 * has no per-instance connection registry. If that changes, this hook is the
 * only file that needs to swap to an EventSource.
 */
export function useUnreadNotificationCount() {
  return useQuery<number>({
    queryKey: [...NOTIFICATIONS_KEY, "unread-count"],
    queryFn: NotificationService.getUnreadCount,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
    staleTime: 30_000,
    // A failed poll should not surface an error state in the header — the
    // bell just keeps showing the last known count.
    retry: 1,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) =>
      NotificationService.markRead(notificationId),
    // Optimistic: the row is usually clicked on its way to somewhere else, so
    // the user is mid-navigation by the time the request lands.
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_KEY });

      const previous = queryClient.getQueriesData<TNotificationListResponse>({
        queryKey: [...NOTIFICATIONS_KEY, "list"],
      });
      const previousCount = queryClient.getQueryData<number>([
        ...NOTIFICATIONS_KEY,
        "unread-count",
      ]);

      queryClient.setQueriesData<TNotificationListResponse>(
        { queryKey: [...NOTIFICATIONS_KEY, "list"] },
        (old) =>
          old
            ? {
                ...old,
                data: old.data.map((n) =>
                  n.id === notificationId ? { ...n, isRead: true } : n,
                ),
                unreadCount: Math.max(0, old.unreadCount - 1),
              }
            : old,
      );
      queryClient.setQueryData<number>(
        [...NOTIFICATIONS_KEY, "unread-count"],
        (old) => Math.max(0, (old ?? 1) - 1),
      );

      return { previous, previousCount };
    },
    onError: (_err, _id, ctx) => {
      // Roll the optimistic update back. No toast: marking-as-read is a side
      // effect of clicking through to something, and an error toast about it
      // would interrupt a navigation the user cares about more.
      ctx?.previous?.forEach(([key, value]) => {
        queryClient.setQueryData(key, value);
      });
      if (ctx?.previousCount !== undefined) {
        queryClient.setQueryData(
          [...NOTIFICATIONS_KEY, "unread-count"],
          ctx.previousCount,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: NotificationService.markAllRead,
    onSuccess: (updated) => {
      toast.success(
        updated === 0
          ? "Nothing left to mark as read."
          : `${updated} notification${updated === 1 ? "" : "s"} marked as read.`,
      );
    },
    onError: (err) => {
      toast.error(
        getErrorMessage(
          err,
          "We couldn't mark your notifications as read. Please try again.",
        ),
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
    },
  });
}
