/**
 * Mark Notifications as Read API Route
 *
 * POST /api/notifications/mark-read - Mark one or more notifications as read
 */
import {
  canUserAccessNotification,
  markNotificationAsRead,
  markNotificationsAsRead,
} from '@lib/db/notification-center';
import { getUserProfileByIdLegacy as getProfile } from '@lib/db/profiles';
import { createAPIClient } from '@lib/supabase/api-client';
import type {
  MarkAsReadRequest,
  MarkAsReadResponse,
} from '@lib/types/notification-center';

import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/notifications/mark-read
 * Mark one or more notifications as read for the current user
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

    const body: MarkAsReadRequest = await request.json();

    // Validate request body
    if (!body.notification_ids || !Array.isArray(body.notification_ids)) {
      return NextResponse.json(
        { error: 'notification_ids must be an array' },
        { status: 400 }
      );
    }

    if (body.notification_ids.length === 0) {
      return NextResponse.json(
        { error: 'notification_ids array cannot be empty' },
        { status: 400 }
      );
    }

    // Validate UUID format for each ID
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const invalidIds = body.notification_ids.filter(id => !uuidRegex.test(id));
    if (invalidIds.length > 0) {
      return NextResponse.json(
        { error: `Invalid notification ID format: ${invalidIds.join(', ')}` },
        { status: 400 }
      );
    }

    // Limit the number of notifications that can be marked at once
    if (body.notification_ids.length > 100) {
      return NextResponse.json(
        { error: 'Cannot mark more than 100 notifications at once' },
        { status: 400 }
      );
    }

    // Get user profile for role information
    const profile = await getProfile(user.id);
    if (!profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Verify user has access to all notifications before marking any as read
    const accessChecks = await Promise.all(
      body.notification_ids.map(id =>
        canUserAccessNotification(user.id, profile.role, id, supabase)
      )
    );

    const inaccessibleIds = body.notification_ids.filter(
      (_, index) => !accessChecks[index]
    );
    if (inaccessibleIds.length > 0) {
      return NextResponse.json(
        {
          error: 'Access denied to some notifications',
          inaccessible_ids: inaccessibleIds,
        },
        { status: 403 }
      );
    }

    // Mark notifications as read with authenticated client
    let markedCount: number;

    if (body.notification_ids.length === 1) {
      // Single notification - use individual method
      await markNotificationAsRead(body.notification_ids[0], user.id, supabase);
      markedCount = 1;
    } else {
      // Multiple notifications - use batch method
      markedCount = await markNotificationsAsRead(
        body.notification_ids,
        user.id,
        supabase
      );
    }

    const response: MarkAsReadResponse = {
      marked_count: markedCount,
      success: true,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark notifications as read' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/notifications/mark-read (not allowed)
 * Return method not allowed for GET requests
 */
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405, headers: { Allow: 'POST' } }
  );
}
