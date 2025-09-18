/**
 * Notification Unread Count Operations
 *
 * Operations for retrieving unread notification counts and statistics.
 */
import { createClient } from '@lib/supabase/client';
import type {
  NotificationType,
  UnreadCount,
} from '@lib/types/notification-center';

const supabase = createClient();

/**
 * Get unread count for a user using the database function
 */
export async function getUserUnreadCount(
  userId: string,
  type?: NotificationType
): Promise<UnreadCount> {
  const { data, error } = await supabase.rpc('get_user_unread_count', {
    user_uuid: userId,
    notification_type: type || null,
  });

  if (error) {
    throw new Error(`Failed to get unread count: ${error.message}`);
  }

  // The function returns an array with one object
  const result = data?.[0] || {
    changelog_count: 0,
    message_count: 0,
    total_count: 0,
  };

  return {
    changelog: Number(result.changelog_count) || 0,
    message: Number(result.message_count) || 0,
    total: Number(result.total_count) || 0,
  };
}

/**
 * Get detailed unread counts by category for a user using efficient database query
 */
export async function getUserUnreadCountByCategory(userId: string): Promise<{
  [category: string]: number;
}> {
  // Use database function for better performance with large datasets
  const { data, error } = await supabase.rpc(
    'get_user_unread_count_by_category',
    {
      user_uuid: userId,
    }
  );

  if (error) {
    throw new Error(`Failed to get unread count by category: ${error.message}`);
  }

  const categoryCounts: { [category: string]: number } = {};

  // Transform the database result to object format
  data?.forEach((row: { category: string; count: number }) => {
    categoryCounts[row.category || 'uncategorized'] = Number(row.count) || 0;
  });

  return categoryCounts;
}
