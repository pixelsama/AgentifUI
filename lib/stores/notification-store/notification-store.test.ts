/**
 * Notification Store Tests
 * @description Comprehensive tests for notification state management
 */
import type { NotificationWithReadStatus } from '@lib/types/notification-center';
import { act } from '@testing-library/react';

import { useNotificationStore } from './notification-store';

// Mock fetch API
global.fetch = jest.fn();

// Extend URLSearchParams mock from jest.setup.js
class MockURLSearchParams {
  private _params = new Map<string, string>();

  append(name: string, value: string): void {
    this._params.set(name, value);
  }

  toString(): string {
    const parts: string[] = [];
    this._params.forEach((value, key) => {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
    });
    return parts.join('&');
  }
}

global.URLSearchParams =
  MockURLSearchParams as unknown as typeof URLSearchParams;

const createMockNotification = (
  id: string,
  isRead = false
): NotificationWithReadStatus => ({
  id,
  type: 'message',
  title: `Test ${id}`,
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
  is_read: isRead,
  read_at: isRead ? new Date().toISOString() : null,
});

describe('Notification Store', () => {
  beforeEach(() => {
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

  describe('fetchNotifications', () => {
    it('should fetch notifications successfully', async () => {
      const mockNotifications = [
        createMockNotification('1'),
        createMockNotification('2'),
      ];
      const mockData = {
        notifications: mockNotifications,
        unread_count: { changelog: 0, message: 2, total: 2 },
        has_more: true,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      await act(async () => {
        await useNotificationStore.getState().fetchNotifications();
      });

      const store = useNotificationStore.getState();
      expect(store.isLoading).toBe(false);
      expect(store.error).toBeNull();
      expect(store.notifications).toEqual(mockNotifications);
      expect(store.unreadCount).toEqual(mockData.unread_count);
      expect(store.hasMore).toBe(true);
      expect(store.offset).toBe(2);
    });

    it('should append notifications when append is true', async () => {
      const existingNotifications = [createMockNotification('1')];
      const newNotifications = [createMockNotification('2')];

      useNotificationStore.setState({
        notifications: existingNotifications,
        offset: 1,
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          notifications: newNotifications,
          unread_count: { changelog: 0, message: 2, total: 2 },
          has_more: false,
        }),
      });

      await act(async () => {
        await useNotificationStore.getState().fetchNotifications({}, true);
      });

      const store = useNotificationStore.getState();
      expect(store.notifications).toHaveLength(2);
      expect(store.notifications[0].id).toBe('1');
      expect(store.notifications[1].id).toBe('2');
      expect(store.offset).toBe(2);
    });

    it('should handle fetch error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      });

      await act(async () => {
        await useNotificationStore.getState().fetchNotifications();
      });

      const store = useNotificationStore.getState();
      expect(store.isLoading).toBe(false);
      expect(store.error).toBe('Failed to fetch notifications');
      expect(store.notifications).toEqual([]);
    });

    it('should filter by type when activeTab is not all', async () => {
      useNotificationStore.setState({ activeTab: 'changelog' });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          notifications: [],
          unread_count: { changelog: 0, message: 0, total: 0 },
          has_more: false,
        }),
      });

      await act(async () => {
        await useNotificationStore.getState().fetchNotifications();
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('type=changelog')
      );
    });
  });

  describe('markAsRead', () => {
    it('should mark notifications as read with optimistic update', async () => {
      const mockNotifications = [
        createMockNotification('1', false),
        createMockNotification('2', false),
      ];

      useNotificationStore.setState({ notifications: mockNotifications });

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({}),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            unread_count: { changelog: 0, message: 0, total: 0 },
          }),
        });

      await act(async () => {
        await useNotificationStore.getState().markAsRead(['1']);
      });

      const store = useNotificationStore.getState();
      expect(store.notifications[0].is_read).toBe(true);
      expect(store.notifications[0].read_at).toBeTruthy();
      expect(store.notifications[1].is_read).toBe(false);
    });

    it('should revert optimistic update on API failure', async () => {
      const mockNotifications = [
        createMockNotification('1', false),
        createMockNotification('2', false),
      ];

      useNotificationStore.setState({ notifications: mockNotifications });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      });

      await act(async () => {
        await useNotificationStore.getState().markAsRead(['1']);
      });

      const store = useNotificationStore.getState();
      // Should revert to original state
      expect(store.notifications[0].is_read).toBe(false);
      expect(store.notifications[0].read_at).toBeNull();
      expect(store.error).toBe('Failed to mark notifications as read');
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all unread notifications as read', async () => {
      const mockNotifications = [
        createMockNotification('1', false),
        createMockNotification('2', false),
        createMockNotification('3', true),
      ];

      useNotificationStore.setState({ notifications: mockNotifications });

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({}),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            unread_count: { changelog: 0, message: 0, total: 0 },
          }),
        });

      await act(async () => {
        await useNotificationStore.getState().markAllAsRead();
      });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/notifications/mark-read',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ notification_ids: ['1', '2'] }),
        })
      );
    });

    it('should filter by active tab when marking all as read', async () => {
      const mockNotifications = [
        { ...createMockNotification('1', false), type: 'message' as const },
        { ...createMockNotification('2', false), type: 'changelog' as const },
      ];

      useNotificationStore.setState({
        notifications: mockNotifications,
        activeTab: 'message',
      });

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({}),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            unread_count: { changelog: 0, message: 0, total: 0 },
          }),
        });

      await act(async () => {
        await useNotificationStore.getState().markAllAsRead();
      });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/notifications/mark-read',
        expect.objectContaining({
          body: JSON.stringify({ notification_ids: ['1'] }),
        })
      );
    });

    it('should do nothing when no unread notifications', async () => {
      const mockNotifications = [createMockNotification('1', true)];

      useNotificationStore.setState({ notifications: mockNotifications });

      await act(async () => {
        await useNotificationStore.getState().markAllAsRead();
      });

      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('updateUnreadCount', () => {
    it('should update unread count successfully', async () => {
      const mockUnreadCount = { changelog: 1, message: 2, total: 3 };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ unread_count: mockUnreadCount }),
      });

      await act(async () => {
        await useNotificationStore.getState().updateUnreadCount();
      });

      const store = useNotificationStore.getState();
      expect(store.unreadCount).toEqual(mockUnreadCount);
    });

    it('should handle error and set error state', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      });

      await act(async () => {
        await useNotificationStore.getState().updateUnreadCount();
      });

      const store = useNotificationStore.getState();
      expect(store.error).toBe('Failed to fetch unread count');
    });
  });

  describe('loadMore', () => {
    it('should load more notifications when hasMore is true', async () => {
      useNotificationStore.setState({
        notifications: [createMockNotification('1')],
        hasMore: true,
        offset: 1,
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          notifications: [createMockNotification('2')],
          unread_count: { changelog: 0, message: 0, total: 0 },
          has_more: false,
        }),
      });

      await act(async () => {
        await useNotificationStore.getState().loadMore();
      });

      const store = useNotificationStore.getState();
      expect(store.notifications).toHaveLength(2);
    });

    it('should not load when hasMore is false', async () => {
      useNotificationStore.setState({ hasMore: false });

      await act(async () => {
        await useNotificationStore.getState().loadMore();
      });

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should not load when already loading', async () => {
      useNotificationStore.setState({ hasMore: true, isLoading: true });

      await act(async () => {
        await useNotificationStore.getState().loadMore();
      });

      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('State Management', () => {
    it('should reset store to initial state', () => {
      const mockNotification = createMockNotification('1');

      useNotificationStore.setState({
        notifications: [mockNotification],
        isLoading: true,
        error: 'test error',
        activeTab: 'changelog',
        hasMore: true,
        offset: 10,
      });

      useNotificationStore.getState().reset();

      const store = useNotificationStore.getState();
      expect(store.notifications).toEqual([]);
      expect(store.isLoading).toBe(false);
      expect(store.error).toBeNull();
      expect(store.activeTab).toBe('all');
      expect(store.hasMore).toBe(false);
      expect(store.offset).toBe(0);
    });

    it('should set active tab and fetch notifications', () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          notifications: [],
          unread_count: { changelog: 0, message: 0, total: 0 },
          has_more: false,
        }),
      });

      useNotificationStore.getState().setActiveTab('message');

      const store = useNotificationStore.getState();
      expect(store.activeTab).toBe('message');
      expect(store.offset).toBe(0);
      expect(global.fetch).toHaveBeenCalled();
    });
  });
});
