/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  createNotification,
  getNotificationsWithReadStatus,
  getUserUnreadCount,
} from '@lib/db/notification-center';
import { getUserProfileByIdLegacy as getProfile } from '@lib/db/profiles';
import { createAPIClient } from '@lib/supabase/api-client';

import { NextRequest } from 'next/server';

import { GET, POST } from '../route';

// Mock modules
jest.mock('@lib/supabase/api-client');
jest.mock('@lib/db/notification-center');
jest.mock('@lib/db/profiles');

const mockCreateAPIClient = createAPIClient as jest.MockedFunction<
  typeof createAPIClient
>;
const mockGetNotificationsWithReadStatus =
  getNotificationsWithReadStatus as jest.MockedFunction<
    typeof getNotificationsWithReadStatus
  >;
const mockGetUserUnreadCount = getUserUnreadCount as jest.MockedFunction<
  typeof getUserUnreadCount
>;
const mockCreateNotification = createNotification as jest.MockedFunction<
  typeof createNotification
>;
const mockGetProfile = getProfile as jest.MockedFunction<typeof getProfile>;

describe('/api/notifications', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should be defined', () => {
      expect(GET).toBeDefined();
    });

    it('should return 401 when user is not authenticated', async () => {
      mockCreateAPIClient.mockResolvedValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: null },
            error: null,
          }),
        },
      } as any);

      const request = new NextRequest(
        'http://localhost:3000/api/notifications'
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 404 when user profile not found', async () => {
      mockCreateAPIClient.mockResolvedValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'test-user-id' } },
            error: null,
          }),
        },
      } as any);

      mockGetProfile.mockResolvedValue(null);

      const request = new NextRequest(
        'http://localhost:3000/api/notifications'
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('User profile not found');
    });

    it('should successfully return notifications', async () => {
      mockCreateAPIClient.mockResolvedValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'test-user-id' } },
            error: null,
          }),
        },
      } as any);

      mockGetProfile.mockResolvedValue({
        id: 'test-user-id',
        role: 'user',
      } as any);

      mockGetNotificationsWithReadStatus.mockResolvedValue({
        notifications: [],
        total_count: 0,
      });

      mockGetUserUnreadCount.mockResolvedValue({
        changelog: 0,
        message: 0,
        total: 0,
      });

      const request = new NextRequest(
        'http://localhost:3000/api/notifications'
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        notifications: [],
        total_count: 0,
        has_more: false,
        unread_count: {
          changelog: 0,
          message: 0,
          total: 0,
        },
      });
    });
  });

  describe('POST', () => {
    it('should be defined', () => {
      expect(POST).toBeDefined();
    });

    it('should return 401 when user is not authenticated', async () => {
      mockCreateAPIClient.mockResolvedValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: null },
            error: null,
          }),
        },
      } as any);

      const request = new NextRequest(
        'http://localhost:3000/api/notifications',
        {
          method: 'POST',
          body: JSON.stringify({
            type: 'message',
            title: 'Test',
            content: 'Test content',
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 403 when user does not have admin/manager role', async () => {
      mockCreateAPIClient.mockResolvedValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'test-user-id' } },
            error: null,
          }),
        },
      } as any);

      mockGetProfile.mockResolvedValue({
        id: 'test-user-id',
        role: 'user',
      } as any);

      const request = new NextRequest(
        'http://localhost:3000/api/notifications',
        {
          method: 'POST',
          body: JSON.stringify({
            type: 'message',
            title: 'Test',
            content: 'Test content',
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe(
        'Insufficient permissions. Admin or manager role required.'
      );
    });

    it('should return 400 when required fields are missing', async () => {
      mockCreateAPIClient.mockResolvedValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'test-user-id' } },
            error: null,
          }),
        },
      } as any);

      mockGetProfile.mockResolvedValue({
        id: 'test-user-id',
        role: 'admin',
      } as any);

      const request = new NextRequest(
        'http://localhost:3000/api/notifications',
        {
          method: 'POST',
          body: JSON.stringify({ type: 'message' }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Missing required fields: type, title, content');
    });

    it('should successfully create notification for admin user', async () => {
      mockCreateAPIClient.mockResolvedValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'test-user-id' } },
            error: null,
          }),
        },
      } as any);

      mockGetProfile.mockResolvedValue({
        id: 'test-user-id',
        role: 'admin',
      } as any);

      const mockNotification = {
        id: 'notification-id',
        type: 'message',
        title: 'Test Notification',
        content: 'Test content',
      };

      mockCreateNotification.mockResolvedValue(mockNotification as any);

      const request = new NextRequest(
        'http://localhost:3000/api/notifications',
        {
          method: 'POST',
          body: JSON.stringify({
            type: 'message',
            title: 'Test Notification',
            content: 'Test content',
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(mockNotification);
      expect(mockCreateNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'message',
          title: 'Test Notification',
          content: 'Test content',
          priority: 'medium',
          target_roles: [],
          target_users: [],
          published: false,
          metadata: {},
        })
      );
    });
  });
});
