/**
 * Admin Single Notification Management API Route
 *
 * GET /api/admin/notifications/[id] - Get single notification by ID
 * PUT /api/admin/notifications/[id] - Update notification
 * DELETE /api/admin/notifications/[id] - Delete notification
 */
import {
  deleteNotification,
  getAllNotificationsForAdmin,
  updateNotification,
} from '@lib/db/notification-center';
import { createAPIClient } from '@lib/supabase/api-client';
import type { UpdateNotificationData } from '@lib/types/notification-center';

import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/admin/notifications/[id]
 * Get single notification by ID for admin
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createAPIClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin permissions (using direct query like middleware)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Insufficient permissions. Admin role required.' },
        { status: 403 }
      );
    }

    // Get notification by ID
    const { notifications } = await getAllNotificationsForAdmin({
      limit: 1,
      offset: 0,
    });

    const { id } = await params;
    const notification = notifications.find(n => n.id === id);

    if (!notification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(notification);
  } catch (error) {
    console.error('Error fetching admin notification:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notification' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/notifications/[id]
 * Update notification
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createAPIClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin permissions (using direct query like middleware)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Insufficient permissions. Admin role required.' },
        { status: 403 }
      );
    }

    const body = await request.json();

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

    // Validate type if provided
    if (body.type && !['changelog', 'message'].includes(body.type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be "changelog" or "message"' },
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

    const { id } = await params;
    const updateData: UpdateNotificationData = {
      id,
      ...body,
    };

    // Update the notification with authenticated client
    const updatedNotification = await updateNotification(updateData, supabase);

    return NextResponse.json(updatedNotification);
  } catch (error) {
    console.error('Error updating admin notification:', error);
    return NextResponse.json(
      { error: 'Failed to update notification' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/notifications/[id]
 * Delete notification
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createAPIClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin permissions (using direct query like middleware)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Insufficient permissions. Admin role required.' },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Delete the notification with authenticated client
    await deleteNotification(id, supabase);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting admin notification:', error);
    return NextResponse.json(
      { error: 'Failed to delete notification' },
      { status: 500 }
    );
  }
}
