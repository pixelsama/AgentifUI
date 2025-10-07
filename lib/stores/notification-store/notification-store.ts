import type {
  GetNotificationsParams,
  NotificationTab,
  NotificationWithReadStatus,
  UnreadCount,
} from '@lib/types/notification-center';
import { create } from 'zustand';

/**
 * Notification state management store
 *
 * Manages the global state for the notification system including:
 * - Notification list with read status
 * - Unread count tracking
 * - Active tab selection
 * - Loading and error states
 */
interface NotificationState {
  /** List of notifications with read status */
  notifications: NotificationWithReadStatus[];
  /** Unread count by notification type */
  unreadCount: UnreadCount;
  /** Whether notifications are currently being fetched */
  isLoading: boolean;
  /** Error message if fetch failed */
  error: string | null;
  /** Currently active tab in notification center */
  activeTab: NotificationTab;
  /** Whether there are more notifications to load */
  hasMore: boolean;
  /** Current pagination offset */
  offset: number;

  /**
   * Fetch notifications from the API
   *
   * @param params - Query parameters for filtering notifications
   * @param append - Whether to append to existing notifications or replace
   */
  fetchNotifications: (
    params?: GetNotificationsParams,
    append?: boolean
  ) => Promise<void>;

  /**
   * Mark one or more notifications as read
   *
   * @param notificationIds - Array of notification IDs to mark as read
   */
  markAsRead: (notificationIds: string[]) => Promise<void>;

  /**
   * Mark all notifications as read for the current tab
   */
  markAllAsRead: () => Promise<void>;

  /**
   * Update unread count from the API
   */
  updateUnreadCount: () => Promise<void>;

  /**
   * Set the active tab and fetch corresponding notifications
   *
   * @param tab - Tab to activate
   */
  setActiveTab: (tab: NotificationTab) => void;

  /**
   * Reset the notification store to initial state
   */
  reset: () => void;

  /**
   * Load more notifications (pagination)
   */
  loadMore: () => Promise<void>;
}

const INITIAL_STATE = {
  notifications: [],
  unreadCount: { changelog: 0, message: 0, total: 0 },
  isLoading: false,
  error: null,
  activeTab: 'all' as NotificationTab,
  hasMore: false,
  offset: 0,
};

/**
 * Global notification store using Zustand
 */
export const useNotificationStore = create<NotificationState>((set, get) => ({
  ...INITIAL_STATE,

  fetchNotifications: async (params = {}, append = false) => {
    set({ isLoading: true, error: null });

    try {
      const { activeTab, offset: currentOffset } = get();

      // Build query parameters based on active tab
      const queryParams: GetNotificationsParams = {
        ...params,
        offset: append ? currentOffset : 0,
        limit: params.limit || 20,
      };

      // Filter by type if not on 'all' tab
      if (activeTab !== 'all') {
        queryParams.type = activeTab;
      }

      const searchParams = new URLSearchParams();
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });

      const response = await fetch(
        `/api/notifications?${searchParams.toString()}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data = await response.json();

      set(state => ({
        notifications: append
          ? [...state.notifications, ...data.notifications]
          : data.notifications,
        unreadCount: data.unread_count,
        hasMore: data.has_more,
        offset: append
          ? state.offset + data.notifications.length
          : data.notifications.length,
        isLoading: false,
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
        isLoading: false,
      });
    }
  },

  markAsRead: async notificationIds => {
    try {
      const response = await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notification_ids: notificationIds }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark notifications as read');
      }

      // Update local state optimistically
      set(state => ({
        notifications: state.notifications.map(notification =>
          notificationIds.includes(notification.id)
            ? {
                ...notification,
                is_read: true,
                read_at: new Date().toISOString(),
              }
            : notification
        ),
      }));

      // Refresh unread count
      await get().updateUnreadCount();
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to mark as read',
      });
    }
  },

  markAllAsRead: async () => {
    const { notifications, activeTab } = get();

    // Filter unread notifications based on active tab
    const unreadNotifications = notifications.filter(n => {
      if (activeTab === 'all') return !n.is_read;
      return !n.is_read && n.type === activeTab;
    });

    if (unreadNotifications.length === 0) return;

    const notificationIds = unreadNotifications.map(n => n.id);
    await get().markAsRead(notificationIds);
  },

  updateUnreadCount: async () => {
    try {
      const response = await fetch('/api/notifications/unread-count');

      if (!response.ok) {
        throw new Error('Failed to fetch unread count');
      }

      const data = await response.json();
      set({ unreadCount: data.unread_count });
    } catch (error) {
      console.error('Failed to update unread count:', error);
    }
  },

  setActiveTab: tab => {
    set({ activeTab: tab, offset: 0 });
    // Fetch notifications for the new tab
    get().fetchNotifications();
  },

  loadMore: async () => {
    const { hasMore, isLoading } = get();
    if (!hasMore || isLoading) return;

    await get().fetchNotifications({}, true);
  },

  reset: () => {
    set(INITIAL_STATE);
  },
}));
