/**
 * Admin Notifications Management API Route
 *
 * GET /api/admin/notifications - Get all notifications for admin management
 * POST /api/admin/notifications - Create a new notification (same as /api/notifications)
 */
import {
  createNotification,
  getAllNotificationsForAdmin,
} from '@lib/db/notification-center';
import { getUserProfileByIdLegacy as getProfile } from '@lib/db/profiles';
import { createAPIClient } from '@lib/supabase/api-client';
import type {
  CreateNotificationData,
  GetNotificationsParams,
  NotificationCategory,
} from '@lib/types/notification-center';

import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/admin/notifications
 * Get all notifications for admin management (bypasses RLS targeting)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createAPIClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin permissions
    const profile = await getProfile(user.id);
    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Insufficient permissions. Admin role required.' },
        { status: 403 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const typeParam = searchParams.get('type');
    const categoryParam = searchParams.get('category');
    const priorityParam = searchParams.get('priority');
    const sortByParam = searchParams.get('sort_by');
    const sortOrderParam = searchParams.get('sort_order');

    // Get all valid notification categories from type definition
    const validCategories: readonly NotificationCategory[] = [
      // Message categories
      'admin_announcement',
      'agent_result',
      'token_usage',
      'system_maintenance',
      'security_alert',
      'feature_tip',
      // Changelog categories
      'feature',
      'improvement',
      'bugfix',
      'security',
      'api_change',
    ] as const;

    const params: GetNotificationsParams = {
      type:
        typeParam === 'changelog' || typeParam === 'message'
          ? typeParam
          : undefined,
      category:
        categoryParam &&
        validCategories.includes(categoryParam as NotificationCategory)
          ? (categoryParam as NotificationCategory)
          : undefined,
      limit: parseInt(searchParams.get('limit') || '50'),
      offset: parseInt(searchParams.get('offset') || '0'),
      priority: ['low', 'medium', 'high', 'critical'].includes(
        priorityParam || ''
      )
        ? (priorityParam as 'low' | 'medium' | 'high' | 'critical')
        : undefined,
      sort_by: ['created_at', 'published_at', 'priority'].includes(
        sortByParam || ''
      )
        ? (sortByParam as 'created_at' | 'published_at' | 'priority')
        : 'created_at',
      sort_order:
        sortOrderParam === 'asc' || sortOrderParam === 'desc'
          ? sortOrderParam
          : 'desc',
    };

    // Validate pagination parameters
    if (params.limit && (params.limit < 1 || params.limit > 200)) {
      return NextResponse.json(
        { error: 'Limit must be between 1 and 200' },
        { status: 400 }
      );
    }

    if (params.offset && params.offset < 0) {
      return NextResponse.json(
        { error: 'Offset must be non-negative' },
        { status: 400 }
      );
    }

    // Fetch all notifications for admin view
    const { notifications, total_count } =
      await getAllNotificationsForAdmin(params);

    const response = {
      notifications,
      total_count,
      has_more: (params.offset || 0) + notifications.length < total_count,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching admin notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/notifications
 * Create a new notification (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createAPIClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin permissions
    const profile = await getProfile(user.id);
    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Insufficient permissions. Admin role required.' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate required fields
    const { type, title, content } = body;
    if (!type || !title || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: type, title, content' },
        { status: 400 }
      );
    }

    // Validate type
    if (!['changelog', 'message'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be "changelog" or "message"' },
        { status: 400 }
      );
    }

    // Validate priority if provided
    if (
      body.priority &&
      !['low', 'medium', 'high', 'critical'].includes(body.priority)
    ) {
      return NextResponse.json(
        {
          error:
            'Invalid priority. Must be one of: low, medium, high, critical',
        },
        { status: 400 }
      );
    }

    // Validate target_roles if provided
    if (body.target_roles && Array.isArray(body.target_roles)) {
      const validRoles = ['admin', 'manager', 'user'];
      const invalidRoles = body.target_roles.filter(
        (role: string) => !validRoles.includes(role)
      );
      if (invalidRoles.length > 0) {
        return NextResponse.json(
          {
            error: `Invalid roles: ${invalidRoles.join(', ')}. Must be one of: ${validRoles.join(', ')}`,
          },
          { status: 400 }
        );
      }
    }

    // Validate target_users if provided (should be valid UUIDs)
    if (body.target_users && Array.isArray(body.target_users)) {
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      const invalidUsers = body.target_users.filter(
        (userId: string) => !uuidRegex.test(userId)
      );
      if (invalidUsers.length > 0) {
        return NextResponse.json(
          { error: `Invalid user IDs: ${invalidUsers.join(', ')}` },
          { status: 400 }
        );
      }
    }

    const notificationData: CreateNotificationData = {
      type,
      category: body.category,
      title,
      content,
      priority: body.priority || 'medium',
      target_roles: body.target_roles || [],
      target_users: body.target_users || [],
      published: body.published !== undefined ? body.published : false,
      metadata: body.metadata || {},
    };

    // Create the notification
    const notification = await createNotification(notificationData);

    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    console.error('Error creating admin notification:', error);
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}
