// src/types/notification.types.ts
//
// Response shapes for GET /api/v2/notifications.
// Mirrors NotificationService in the backend (src/v2/notifications/services/
// notification.service.ts) and the catalogue in notification.events.ts.

/**
 * The notification categories the backend emits. These are the `type` column
 * values, and they are what the icon/colour map in
 * src/constants/notification-display.ts is keyed on.
 *
 * The API sends this string and nothing about presentation — no icon
 * component, no Tailwind classes. Same arrangement as the dashboard's
 * activity feed (`TDashboardActivityItem.icon`).
 */
export type TNotificationType =
  | "access"
  | "developer"
  | "project"
  | "mrv"
  | "credit"
  | "finance"
  | "compliance"
  | "system";

export type TNotificationPriority = "low" | "medium" | "high";

export interface TNotification {
  id: string;
  title: string;
  content: string;
  type: TNotificationType;
  priority: TNotificationPriority;
  /** Event key plus whatever entity ids the catalogue attached. */
  metadata: Record<string, unknown> | null;
  /** An in-app route. Always a real one — the backend catalogue guarantees it. */
  actionUrl: string | null;
  createdAt: string;
  isRead: boolean;
  readAt: string | null;
}

export interface TNotificationListResponse {
  data: TNotification[];
  /** Total matching the CURRENT filter — drives "load more". */
  total: number;
  /**
   * Unread across the WHOLE inbox, not the current filter. This is the bell
   * badge's number, and the bell knows nothing about the page's filter tabs.
   */
  unreadCount: number;
}

export interface TNotificationFilters {
  limit?: number;
  offset?: number;
  unreadOnly?: boolean;
  type?: TNotificationType;
}
