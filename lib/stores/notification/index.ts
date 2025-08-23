/**
 * Notification System Exports
 *
 * Centralized export file for the unified notification system.
 * Provides easy access to stores, hooks, and utility functions.
 */

// Core Store Exports
export {
  useNotificationCenter,
  useNotificationCenterOpen,
  useNotificationCenterTab,
  useNotificationList,
  useUnreadCount,
  useNotificationLoading,
  type ActiveTab,
} from '../notification-center-store';

// Type Exports
export type {
  NotificationWithReadStatus,
  NotificationType,
  NotificationPriority,
  NotificationCategory,
  ChangelogCategory,
  UnreadCount,
  NotificationTab,
} from '../../types/notification-center';

// Bridge Store Exports
export {
  useNotificationBridge,
  showSuccessWithDetails,
  showAgentResult,
  showTokenWarning,
  type NotificationWithAction,
} from '../notification-bridge-store';

// Real-time Hooks
export {
  useNotificationRealtime,
  useNotificationPermission,
  useNotificationPreferences,
} from '../../hooks/use-notification-realtime';

// Legacy Notification Bar (for compatibility)
export { useNotificationStore } from '../ui/notification-store';

/**
 * Unified Notification API
 *
 * Provides a simplified interface for common notification operations.
 * Abstracts the complexity of choosing between different notification types.
 */

/**
 * Smart notification function that automatically routes to appropriate display
 */
export async function notify(
  message: string,
  options?: {
    type?: 'success' | 'error' | 'warning' | 'info';
    priority?: 'low' | 'medium' | 'high' | 'critical';
    persistent?: boolean;
    category?: string;
    content?: string;
    action?: {
      text: string;
      handler: () => void;
    };
  }
) {
  // Import here to avoid circular dependencies
  const { useNotificationBridge } = await import(
    '../notification-bridge-store'
  );

  const {
    type = 'info',
    priority = 'medium',
    persistent = false,
    category,
    content,
    action,
  } = options || {};

  if (persistent && content) {
    // Create persistent notification
    const bridge = useNotificationBridge.getState();
    bridge.createPersistentNotification(message, {
      type: 'message',
      category: category as
        | 'admin_announcement'
        | 'agent_result'
        | 'token_usage'
        | 'system_maintenance'
        | 'security_alert'
        | 'feature_tip',
      title: message,
      content,
      priority: priority as 'low' | 'medium' | 'high' | 'critical',
      published: true,
      published_at: new Date().toISOString(),
      target_roles: [],
      target_users: [],
      updated_at: new Date().toISOString(),
      created_by: null,
      metadata: {},
    });
  } else {
    // Show temporary notification
    const bridge = useNotificationBridge.getState();
    bridge.showNotificationWithAction(message, type, 3000, action);
  }
}

/**
 * Quick notification functions for common scenarios
 */
export const notificationHelpers = {
  /**
   * Show success message with optional details
   */
  success: (message: string, details?: string, persistent = false) => {
    notify(message, {
      type: 'success',
      priority: 'low',
      persistent,
      content: details,
      category: persistent ? 'feature_tip' : undefined,
    });
  },

  /**
   * Show error message with optional details
   */
  error: (message: string, details?: string, persistent = true) => {
    notify(message, {
      type: 'error',
      priority: 'high',
      persistent,
      content: details,
      category: persistent ? 'security_alert' : undefined,
    });
  },

  /**
   * Show warning message
   */
  warning: (message: string, details?: string, persistent = false) => {
    notify(message, {
      type: 'warning',
      priority: 'medium',
      persistent,
      content: details,
      category: persistent ? 'system_maintenance' : undefined,
    });
  },

  /**
   * Show info message
   */
  info: (message: string, details?: string, persistent = false) => {
    notify(message, {
      type: 'info',
      priority: 'low',
      persistent,
      content: details,
      category: persistent ? 'feature_tip' : undefined,
    });
  },

  /**
   * Show admin announcement
   */
  adminAnnouncement: (
    title: string,
    content: string,
    priority: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ) => {
    notify(title, {
      type: 'info',
      priority,
      persistent: true,
      category: 'admin_announcement',
      content,
    });
  },

  /**
   * Show changelog update
   */
  changelog: (
    title: string,
    content: string,
    category:
      | 'feature'
      | 'improvement'
      | 'bugfix'
      | 'security'
      | 'api_change' = 'feature'
  ) => {
    notify(`新功能: ${title}`, {
      type: 'info',
      priority: 'low',
      persistent: true,
      category,
      content,
    });
  },
};

/**
 * Notification center control functions
 */
export const notificationCenter = {
  /**
   * Open notification center to specific tab
   */
  open: async (tab: 'all' | 'changelog' | 'message' = 'all') => {
    const { useNotificationCenter } = await import(
      '../notification-center-store'
    );
    const center = useNotificationCenter.getState();
    center.openCenter();
    center.setActiveTab(tab);
  },

  /**
   * Close notification center
   */
  close: async () => {
    const { useNotificationCenter } = await import(
      '../notification-center-store'
    );
    const center = useNotificationCenter.getState();
    center.closeCenter();
  },

  /**
   * Mark all notifications as read
   */
  markAllRead: async (type?: 'changelog' | 'message') => {
    const { useNotificationCenter } = await import(
      '../notification-center-store'
    );
    const center = useNotificationCenter.getState();
    center.markAllAsRead(type);
  },

  /**
   * Get current unread count
   */
  getUnreadCount: async () => {
    const { useNotificationCenter } = await import(
      '../notification-center-store'
    );
    const center = useNotificationCenter.getState();
    return center.unreadCount;
  },

  /**
   * Refresh notifications
   */
  refresh: async (type?: 'changelog' | 'message') => {
    const { useNotificationCenter } = await import(
      '../notification-center-store'
    );
    const center = useNotificationCenter.getState();
    center.fetchNotifications(type, true);
  },
};

/**
 * Default export for convenience
 */
const NotificationSystem = {
  notify,
  helpers: notificationHelpers,
  center: notificationCenter,
};

export default NotificationSystem;
