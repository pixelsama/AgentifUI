/**
 * Notification Store Tests
 * @description Basic tests for notification state management
 */
import type { NotificationWithReadStatus } from '@lib/types/notification-center';

import { useNotificationStore } from '../notification-store';

// Mock fetch API
global.fetch = jest.fn();

describe('Notification Store', () => {
  beforeEach(() => {
    // Reset store and mocks
    useNotificationStore.getState().reset();
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const store = useNotificationStore.getState();

      expect(store.notifications).toEqual([]);
      expect(store.unreadCount).toEqual({ changelog: 0, message: 0, total: 0 });
      expect(store.isLoading).toBe(false);
      expect(store.error).toBeNull();
      expect(store.activeTab).toBe('all');
      expect(store.hasMore).toBe(false);
      expect(store.offset).toBe(0);
    });
  });

  describe('State Management', () => {
    it('should reset store to initial state', () => {
      // Modify state
      const mockNotification: NotificationWithReadStatus = {
        id: '1',
        type: 'message',
        title: 'Test',
        content: 'Test content',
        priority: 'medium',
        target_roles: [],
        target_users: [],
        published: true,
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        created_by: null,
        updated_at: new Date().toISOString(),
        metadata: {},
        is_read: false,
        read_at: null,
      };

      useNotificationStore.setState({
        notifications: [mockNotification],
        isLoading: true,
        error: 'test error',
        activeTab: 'changelog',
        hasMore: true,
        offset: 10,
      });

      // Reset
      useNotificationStore.getState().reset();

      // Verify reset
      const store = useNotificationStore.getState();
      expect(store.notifications).toEqual([]);
      expect(store.isLoading).toBe(false);
      expect(store.error).toBeNull();
      expect(store.activeTab).toBe('all');
      expect(store.hasMore).toBe(false);
      expect(store.offset).toBe(0);
    });

    it('should set active tab', () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          notifications: [],
          unread_count: { changelog: 0, message: 0, total: 0 },
          has_more: false,
          total_count: 0,
        }),
      });

      useNotificationStore.getState().setActiveTab('message');

      const store = useNotificationStore.getState();
      expect(store.activeTab).toBe('message');
      expect(store.offset).toBe(0);
    });
  });
});
