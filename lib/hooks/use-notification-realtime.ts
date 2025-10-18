/**
 * Real-time notification updates hook
 *
 * Subscribes to notification changes and automatically updates the store
 */
import { useNotificationStore } from '@lib/stores/notification-store';
import { createClient } from '@lib/supabase/client';

import { useEffect, useRef } from 'react';

const supabase = createClient();

/**
 * Hook to enable real-time notification updates
 *
 * Automatically subscribes to notification and read status changes,
 * refreshing the store when changes occur.
 *
 * @param options - Configuration options
 * @param options.enabled - Whether real-time updates are enabled (default: true)
 * @param options.onNewNotification - Callback when a new notification is received
 */
export function useNotificationRealtime(options?: {
  enabled?: boolean;
  onNewNotification?: (notification: unknown) => void;
}) {
  const { enabled = true, onNewNotification } = options ?? {};
  const { fetchNotifications, updateUnreadCount } = useNotificationStore();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const setupRealtime = async () => {
      // Get current user
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) return;

      const userId = session.user.id;

      // Create a channel for notifications
      const channel = supabase
        .channel(`notifications:${userId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications',
          },
          payload => {
            console.log(
              '[Notification realtime] Notification changed:',
              payload
            );

            // Call callback for new notifications
            if (payload.eventType === 'INSERT' && onNewNotification) {
              onNewNotification(payload.new);
            }

            // Refresh notifications and unread count
            updateUnreadCount();
            fetchNotifications();
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notification_reads',
            filter: `user_id=eq.${userId}`,
          },
          payload => {
            console.log(
              '[Notification realtime] Read status changed:',
              payload
            );

            // Refresh notifications to update read status
            updateUnreadCount();
            fetchNotifications();
          }
        )
        .subscribe(status => {
          console.log('[Notification realtime] Subscription status:', status);
        });

      channelRef.current = channel;
    };

    setupRealtime();

    // Cleanup: unsubscribe when component unmounts
    return () => {
      if (channelRef.current) {
        console.log('[Notification realtime] Unsubscribing...');
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [enabled, fetchNotifications, updateUnreadCount, onNewNotification]);

  return {
    isConnected: channelRef.current !== null,
  };
}
