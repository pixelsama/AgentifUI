/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  canUserAccessNotification,
  deleteNotification,
  getNotificationById,
  updateNotification,
} from '@lib/db/notification-center';
import { getUserProfileByIdLegacy as getProfile } from '@lib/db/profiles';
import { createAPIClient } from '@lib/supabase/api-client';

import { NextRequest } from 'next/server';

import { DELETE, GET, PUT } from '../route';

// Mock modules
jest.mock('@lib/supabase/api-client');
jest.mock('@lib/db/notification-center');
jest.mock('@lib/db/profiles');

const mockCreateAPIClient = createAPIClient as jest.MockedFunction<
  typeof createAPIClient
>;
const mockCanUserAccessNotification =
  canUserAccessNotification as jest.MockedFunction<
    typeof canUserAccessNotification
  >;
const mockGetNotificationById = getNotificationById as jest.MockedFunction<
  typeof getNotificationById
>;
const mockUpdateNotification = updateNotification as jest.MockedFunction<
  typeof updateNotification
>;
const mockDeleteNotification = deleteNotification as jest.MockedFunction<
  typeof deleteNotification
>;
const mockGetProfile = getProfile as jest.MockedFunction<typeof getProfile>;

const testNotificationId = '550e8400-e29b-41d4-a716-446655440000';
const invalidId = 'invalid-id';

describe('/api/notifications/[id]', () => {
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
        `http://localhost:3000/api/notifications/${testNotificationId}`
      );
      const response = await GET(request, {
        params: Promise.resolve({ id: testNotificationId }),
      });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 400 for invalid UUID format', async () => {
      mockCreateAPIClient.mockResolvedValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'test-user-id' } },
            error: null,
          }),
        },
      } as any);

      const request = new NextRequest(
        `http://localhost:3000/api/notifications/${invalidId}`
      );
      const response = await GET(request, {
        params: Promise.resolve({ id: invalidId }),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid notification ID format');
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
        `http://localhost:3000/api/notifications/${testNotificationId}`
      );
      const response = await GET(request, {
        params: Promise.resolve({ id: testNotificationId }),
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('User profile not found');
    });

    it('should return 404 when user has no access to notification', async () => {
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

      mockCanUserAccessNotification.mockResolvedValue(false);

      const request = new NextRequest(
        `http://localhost:3000/api/notifications/${testNotificationId}`
      );
      const response = await GET(request, {
        params: Promise.resolve({ id: testNotificationId }),
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Notification not found or access denied');
    });

    it('should successfully return notification when user has access', async () => {
      const mockNotification = {
        id: testNotificationId,
        type: 'message',
        title: 'Test Notification',
        content: 'Test content',
      };

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

      mockCanUserAccessNotification.mockResolvedValue(true);
      mockGetNotificationById.mockResolvedValue(mockNotification as any);

      const request = new NextRequest(
        `http://localhost:3000/api/notifications/${testNotificationId}`
      );
      const response = await GET(request, {
        params: Promise.resolve({ id: testNotificationId }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockNotification);
      expect(mockCanUserAccessNotification).toHaveBeenCalledWith(
        'test-user-id',
        'user',
        testNotificationId
      );
      expect(mockGetNotificationById).toHaveBeenCalledWith(testNotificationId);
    });
  });

  describe('PUT', () => {
    it('should be defined', () => {
      expect(PUT).toBeDefined();
    });

    it('should return 403 when user is not admin/manager', async () => {
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
        `http://localhost:3000/api/notifications/${testNotificationId}`,
        {
          method: 'PUT',
          body: JSON.stringify({ title: 'Updated Title' }),
        }
      );

      const response = await PUT(request, {
        params: Promise.resolve({ id: testNotificationId }),
      });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe(
        'Insufficient permissions. Admin or manager role required.'
      );
    });

    it('should successfully update notification for admin user', async () => {
      const mockUpdatedNotification = {
        id: testNotificationId,
        type: 'message',
        title: 'Updated Title',
        content: 'Test content',
      };

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

      mockGetNotificationById.mockResolvedValue({
        id: testNotificationId,
        title: 'Original Title',
      } as any);

      mockUpdateNotification.mockResolvedValue(mockUpdatedNotification as any);

      const request = new NextRequest(
        `http://localhost:3000/api/notifications/${testNotificationId}`,
        {
          method: 'PUT',
          body: JSON.stringify({ title: 'Updated Title' }),
        }
      );

      const response = await PUT(request, {
        params: Promise.resolve({ id: testNotificationId }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockUpdatedNotification);
      expect(mockUpdateNotification).toHaveBeenCalledWith({
        id: testNotificationId,
        title: 'Updated Title',
      });
    });
  });

  describe('DELETE', () => {
    it('should be defined', () => {
      expect(DELETE).toBeDefined();
    });

    it('should return 403 when user is not admin', async () => {
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
        role: 'manager', // managers can update but not delete
      } as any);

      const request = new NextRequest(
        `http://localhost:3000/api/notifications/${testNotificationId}`,
        {
          method: 'DELETE',
        }
      );

      const response = await DELETE(request, {
        params: Promise.resolve({ id: testNotificationId }),
      });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Insufficient permissions. Admin role required.');
    });

    it('should successfully delete notification for admin user', async () => {
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

      mockGetNotificationById.mockResolvedValue({
        id: testNotificationId,
        title: 'Test Notification',
      } as any);

      mockDeleteNotification.mockResolvedValue(undefined);

      const request = new NextRequest(
        `http://localhost:3000/api/notifications/${testNotificationId}`,
        {
          method: 'DELETE',
        }
      );

      const response = await DELETE(request, {
        params: Promise.resolve({ id: testNotificationId }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Notification deleted successfully');
      expect(mockDeleteNotification).toHaveBeenCalledWith(testNotificationId);
    });
  });
});
