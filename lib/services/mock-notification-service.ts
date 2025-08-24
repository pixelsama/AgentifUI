/**
 * Mock notification service for UI testing
 * TODO: Remove when real database is implemented
 */
import type {
  NotificationWithReadStatus,
  UnreadCount,
} from '../types/notification-center';

// Mock notifications
const mockNotifications: NotificationWithReadStatus[] = [
  {
    id: 'mock-1',
    type: 'message',
    category: 'admin_announcement',
    title: '系统维护通知',
    content:
      '系统将于明天凌晨2:00-4:00进行例行维护，期间可能会有短暂的服务中断。',
    priority: 'high',
    published: true,
    published_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    target_roles: [],
    target_users: [],
    created_by: null,
    metadata: {},
    is_read: false,
    read_at: null,
  },
  {
    id: 'mock-2',
    type: 'changelog',
    category: 'feature',
    title: '🎉 新功能：智能对话增强',
    content: '我们升级了AI对话系统，现在支持更自然的多轮对话和上下文理解。',
    priority: 'medium',
    published: true,
    published_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    target_roles: [],
    target_users: [],
    created_by: null,
    metadata: {},
    is_read: false,
    read_at: null,
  },
  {
    id: 'mock-3',
    type: 'changelog',
    category: 'bugfix',
    title: '修复：聊天历史加载问题',
    content: '修复了部分用户无法正确加载历史对话记录的问题。',
    priority: 'low',
    published: true,
    published_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    target_roles: [],
    target_users: [],
    created_by: null,
    metadata: {},
    is_read: true,
    read_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
];

// Calculate mock unread count
export const getMockUnreadCount = (): UnreadCount => ({
  changelog: mockNotifications.filter(n => n.type === 'changelog' && !n.is_read)
    .length,
  message: mockNotifications.filter(n => n.type === 'message' && !n.is_read)
    .length,
  total: mockNotifications.filter(n => !n.is_read).length,
});

export const getMockNotifications = () => mockNotifications;

// Mock service functions that return promises
export const MockNotificationCenterService = {
  async getNotifications(userId: string, params: any) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));

    let filtered = [...mockNotifications];
    if (params.type) {
      filtered = filtered.filter(n => n.type === params.type);
    }

    // Sort by published_at desc
    filtered.sort(
      (a, b) =>
        new Date(b.published_at || b.created_at).getTime() -
        new Date(a.published_at || a.created_at).getTime()
    );

    const offset = params.offset || 0;
    const limit = params.limit || 20;
    const notifications = filtered.slice(offset, offset + limit);

    return {
      notifications,
      has_more: offset + limit < filtered.length,
      total: filtered.length,
    };
  },

  async getUnreadCount(userId: string) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
    return getMockUnreadCount();
  },

  async markMultipleAsRead(ids: string[], userId: string) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));
    // In a real implementation, this would update the database
    // For mock, we'll just return success
    return { success: true };
  },
};
