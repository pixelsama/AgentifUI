/**
 * Unread Count API Route
 *
 * GET /api/notifications/unread-count - Get unread notification count for current user
 */
import {
  getUserUnreadCount,
  getUserUnreadCountByCategory,
} from '@lib/db/notification-center';
import { createAPIClient } from '@lib/supabase/api-client';
import type {
  NotificationType,
  UnreadCount,
} from '@lib/types/notification-center';

import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/notifications/unread-count
 * Get unread notification count for the current user
 *
 * Query parameters:
 * - type: 'changelog' | 'message' (optional) - Filter by notification type
 * - by_category: 'true' (optional) - Include breakdown by category
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

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const typeFilter = searchParams.get('type') as NotificationType | null;
    const includeCategoryBreakdown = searchParams.get('by_category') === 'true';

    // Validate type parameter if provided
    if (typeFilter && !['changelog', 'message'].includes(typeFilter)) {
      return NextResponse.json(
        { error: 'Invalid type parameter. Must be "changelog" or "message"' },
        { status: 400 }
      );
    }

    // Get unread count
    const unreadCount: UnreadCount = await getUserUnreadCount(
      user.id,
      typeFilter || undefined
    );

    // Prepare response
    const response: {
      unread_count: UnreadCount;
      category_breakdown?: Record<string, number>;
      timestamp: string;
    } = {
      unread_count: unreadCount,
      timestamp: new Date().toISOString(),
    };

    // Include category breakdown if requested
    if (includeCategoryBreakdown) {
      try {
        const categoryBreakdown = await getUserUnreadCountByCategory(user.id);
        response.category_breakdown = categoryBreakdown;
      } catch (error) {
        console.warn('Failed to get category breakdown:', error);
        // Continue without category breakdown if it fails
      }
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return NextResponse.json(
      { error: 'Failed to fetch unread count' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/notifications/unread-count (not allowed)
 * Return method not allowed for POST requests
 */
export async function POST() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405, headers: { Allow: 'GET' } }
  );
}

/**
 * PUT /api/notifications/unread-count (not allowed)
 * Return method not allowed for PUT requests
 */
export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405, headers: { Allow: 'GET' } }
  );
}

/**
 * DELETE /api/notifications/unread-count (not allowed)
 * Return method not allowed for DELETE requests
 */
export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405, headers: { Allow: 'GET' } }
  );
}
