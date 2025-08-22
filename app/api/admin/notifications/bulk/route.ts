/**
 * Admin Bulk Notifications API Route
 *
 * POST /api/admin/notifications/bulk - Perform bulk operations on notifications
 */
import {
  deleteNotification,
  getNotificationById,
  updateNotification,
} from '@lib/db/notification-center';
import { getUserProfileByIdLegacy as getProfile } from '@lib/db/profiles';
import { createAPIClient } from '@lib/supabase/api-client';

import { NextRequest, NextResponse } from 'next/server';

interface BulkActionRequest {
  action: 'publish' | 'unpublish' | 'delete';
  notification_ids: string[];
  data?: {
    published?: boolean;
    [key: string]: unknown;
  };
}

/**
 * POST /api/admin/notifications/bulk
 * Perform bulk operations on notifications (admin only)
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

    const body: BulkActionRequest = await request.json();

    // Validate request body
    if (!body.action || !body.notification_ids) {
      return NextResponse.json(
        { error: 'Missing required fields: action, notification_ids' },
        { status: 400 }
      );
    }

    if (
      !Array.isArray(body.notification_ids) ||
      body.notification_ids.length === 0
    ) {
      return NextResponse.json(
        { error: 'notification_ids must be a non-empty array' },
        { status: 400 }
      );
    }

    // Validate action
    const validActions = ['publish', 'unpublish', 'delete'];
    if (!validActions.includes(body.action)) {
      return NextResponse.json(
        { error: `Invalid action. Must be one of: ${validActions.join(', ')}` },
        { status: 400 }
      );
    }

    // Limit the number of notifications for bulk operations
    if (body.notification_ids.length > 50) {
      return NextResponse.json(
        {
          error:
            'Cannot perform bulk operations on more than 50 notifications at once',
        },
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

    // Check that all notifications exist
    const notificationChecks = await Promise.all(
      body.notification_ids.map(id => getNotificationById(id))
    );

    const missingIds = body.notification_ids.filter(
      (id, index) => !notificationChecks[index]
    );
    if (missingIds.length > 0) {
      return NextResponse.json(
        {
          error: 'Some notifications not found',
          missing_ids: missingIds,
        },
        { status: 404 }
      );
    }

    // Perform bulk operation
    const results = {
      success: [] as string[],
      failed: [] as { id: string; error: string }[],
    };

    for (const notificationId of body.notification_ids) {
      try {
        switch (body.action) {
          case 'publish':
            await updateNotification({
              id: notificationId,
              published: true,
            });
            results.success.push(notificationId);
            break;

          case 'unpublish':
            await updateNotification({
              id: notificationId,
              published: false,
            });
            results.success.push(notificationId);
            break;

          case 'delete':
            await deleteNotification(notificationId);
            results.success.push(notificationId);
            break;
        }
      } catch (error) {
        console.error(
          `Error performing ${body.action} on notification ${notificationId}:`,
          error
        );
        results.failed.push({
          id: notificationId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    const response = {
      action: body.action,
      total_requested: body.notification_ids.length,
      successful: results.success.length,
      failed: results.failed.length,
      results,
    };

    // Return appropriate status code based on results
    if (results.failed.length === 0) {
      return NextResponse.json(response, { status: 200 });
    } else if (results.success.length > 0) {
      // Partial success
      return NextResponse.json(response, { status: 207 }); // Multi-Status
    } else {
      // All failed
      return NextResponse.json(response, { status: 400 });
    }
  } catch (error) {
    console.error('Error performing bulk operation:', error);
    return NextResponse.json(
      { error: 'Failed to perform bulk operation' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/notifications/bulk (not allowed)
 * Return method not allowed for GET requests
 */
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405, headers: { Allow: 'POST' } }
  );
}
