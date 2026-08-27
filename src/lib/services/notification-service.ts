import type {
  TNotificationFilters,
  TNotificationListResponse,
} from "@/types/notification.types";
import { axiosClient } from "../axiosClient";

export const NotificationService = {
  list: async (
    filters: TNotificationFilters = {},
  ): Promise<TNotificationListResponse> => {
    const response = await axiosClient.get("/notifications", {
      params: {
        limit: filters.limit,
        offset: filters.offset,
        // The backend parses this as a string enum, so send it only when true
        // rather than as "false" — an absent param is the default.
        unreadOnly: filters.unreadOnly ? "true" : undefined,
        type: filters.type,
      },
    });

    // total and unreadCount are siblings of `data` on the envelope, not
    // nested inside it, so this one can't use the usual `response.data.data`.
    return {
      data: response.data.data,
      total: response.data.total,
      unreadCount: response.data.unreadCount,
    };
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await axiosClient.get("/notifications/unread-count");
    return response.data.data.unreadCount;
  },

  markRead: async (notificationId: string): Promise<void> => {
    await axiosClient.patch(`/notifications/${notificationId}/read`);
  },

  markAllRead: async (): Promise<number> => {
    const response = await axiosClient.patch("/notifications/read-all");
    return response.data.data.updated;
  },
};
