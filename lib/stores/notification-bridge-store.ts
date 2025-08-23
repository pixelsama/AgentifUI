import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import type {
  NotificationPriority,
  NotificationWithReadStatus,
} from '../types/notification-center';
import { useNotificationCenter } from './notification-center-store';
import { useNotificationStore } from './ui/notification-store';

export interface NotificationWithAction {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  action?: {
    text: string;
    handler: () => void;
  };
}

interface BridgeState {
  // Route notifications based on priority and type
  routeNotification: (
    notification: NotificationWithReadStatus,
    showInBar?: boolean
  ) => void;

  // Enhanced notification bar with actions
  showNotificationWithAction: (
    message: string,
    type: 'success' | 'error' | 'warning' | 'info',
    duration?: number,
    action?: {
      text: string;
      handler: () => void;
    }
  ) => void;

  // Auto-archive mechanism
  createPersistentNotification: (
    barMessage: string,
    persistentData: Omit<
      NotificationWithReadStatus,
      'id' | 'created_at' | 'is_read' | 'read_at'
    >
  ) => Promise<void>;

  // Quick actions
  openCenterToNotification: (
    notificationId: string,
    type?: 'changelog' | 'message'
  ) => void;
  openCenterToTab: (tab: 'all' | 'changelog' | 'message') => void;
}

export const useNotificationBridge = create<BridgeState>()(
  devtools(
    (set, get) => ({
      routeNotification: (
        notification: NotificationWithReadStatus,
        showInBar = true
      ) => {
        const { priority, type, title } = notification;
        const notificationCenter = useNotificationCenter.getState();

        // Add to notification center first
        notificationCenter._addNotification(notification);

        // Determine if should show in NotificationBar based on priority
        if (showInBar) {
          const notificationStore = useNotificationStore.getState();

          // High priority: show immediately in bar with action
          if (priority === 'critical' || priority === 'high') {
            get().showNotificationWithAction(
              title,
              priority === 'critical' ? 'error' : 'warning',
              priority === 'critical' ? 8000 : 5000,
              {
                text: '查看详情',
                handler: () =>
                  get().openCenterToNotification(notification.id, type),
              }
            );
          }
          // Medium priority: show brief notification
          else if (priority === 'medium') {
            notificationStore.showNotification(title, 'info', 3000);
          }
          // Low priority: silent update (badge only)
          // No immediate bar notification for low priority
        }

        // Refresh unread count
        notificationCenter.refreshUnreadCount();
      },

      showNotificationWithAction: (message, type, duration = 3000, action) => {
        const notificationStore = useNotificationStore.getState();

        // Show base notification
        notificationStore.showNotification(message, type, duration);

        // Store action for potential UI integration
        // This could be extended to support actions in the NotificationBar component
        if (action) {
          // For now, we just store the action - the UI component would need to handle this
          console.info('Notification action available:', action.text);
        }
      },

      createPersistentNotification: async (barMessage, persistentData) => {
        const notificationStore = useNotificationStore.getState();
        const notificationCenter = useNotificationCenter.getState();

        // Show immediate feedback in notification bar
        notificationStore.showNotification(barMessage, 'info', 3000);

        try {
          // Create persistent notification in center
          // This would call the actual API when available
          const newNotification: NotificationWithReadStatus = {
            ...persistentData,
            id: crypto.randomUUID(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_read: false,
            read_at: null,
          };

          notificationCenter._addNotification(newNotification);

          // Show enhanced bar notification with action
          setTimeout(() => {
            get().showNotificationWithAction(
              '重要消息已保存到通知中心',
              'success',
              5000,
              {
                text: '查看详情',
                handler: () =>
                  get().openCenterToNotification(
                    newNotification.id,
                    persistentData.type
                  ),
              }
            );
          }, 3200); // After the initial bar notification
        } catch (error) {
          console.error('Failed to create persistent notification:', error);
          notificationStore.showNotification('保存通知失败', 'error', 4000);
        }
      },

      openCenterToNotification: (
        notificationId: string,
        type?: 'changelog' | 'message'
      ) => {
        const notificationCenter = useNotificationCenter.getState();

        // Open notification center
        notificationCenter.openCenter();

        // Switch to appropriate tab
        if (type) {
          notificationCenter.setActiveTab(type);
        }

        // Mark the specific notification as read
        notificationCenter.markAsRead([notificationId]);

        // Scroll to notification (would be handled by UI component)
        console.info(
          `Opening notification center to notification: ${notificationId}`
        );
      },

      openCenterToTab: (tab: 'all' | 'changelog' | 'message') => {
        const notificationCenter = useNotificationCenter.getState();

        notificationCenter.openCenter();
        notificationCenter.setActiveTab(tab);
      },
    }),
    {
      name: 'notification-bridge-store',
      version: 1,
    }
  )
);

// Utility functions for common patterns
export const showSuccessWithDetails = (
  message: string,
  detailsData?: Omit<
    NotificationWithReadStatus,
    'id' | 'created_at' | 'is_read' | 'read_at'
  >
) => {
  const bridge = useNotificationBridge.getState();

  if (detailsData) {
    bridge.createPersistentNotification(message, {
      ...detailsData,
      priority: detailsData.priority || 'low',
    });
  } else {
    const notificationStore = useNotificationStore.getState();
    notificationStore.showNotification(message, 'success');
  }
};

export const showAgentResult = (
  agentName: string,
  success: boolean,
  duration: string,
  details?: string
) => {
  const bridge = useNotificationBridge.getState();

  const message = `Agent "${agentName}" ${success ? '执行成功' : '执行失败'}`;

  bridge.createPersistentNotification(message, {
    type: 'message',
    category: 'agent_result',
    title: message,
    content: `Agent "${agentName}" ${success ? '已成功执行完成' : '执行过程中出现错误'}，耗时${duration}。${details ? `\n\n详情：${details}` : ''}`,
    priority: success ? 'low' : 'medium',
    published: true,
    published_at: new Date().toISOString(),
    target_roles: [],
    target_users: [],
    created_by: null,
    updated_at: new Date().toISOString(),
    metadata: {},
  });
};

export const showTokenWarning = (percentage: number, remaining: number) => {
  const bridge = useNotificationBridge.getState();

  const priority: NotificationPriority =
    percentage >= 90 ? 'high' : percentage >= 75 ? 'medium' : 'low';

  bridge.createPersistentNotification(`Token使用量达到${percentage}%`, {
    type: 'message',
    category: 'token_usage',
    title: 'Token使用量警告',
    content: `您的Token使用量已达到${percentage}%，剩余${remaining}个Token。请注意控制使用量，避免超出限额。`,
    priority,
    published: true,
    published_at: new Date().toISOString(),
    target_roles: [],
    target_users: [],
    created_by: null,
    updated_at: new Date().toISOString(),
    metadata: {},
  });
};
