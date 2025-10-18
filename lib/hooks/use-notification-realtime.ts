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
  const { fetchNotifications } = useNotificationStore();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const setupRealtime = async () => {
      try {
        // Get current user
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error(
            '[Notification realtime] Failed to resolve session:',
            error
          );
          return;
        }

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
              // Call callback for new notifications
              if (payload.eventType === 'INSERT' && onNewNotification) {
                onNewNotification(payload.new);
              }

              // Refresh notifications. Response also refreshes unread counts.
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
            () => {
              // Refresh notifications to update read status/unread counts.
              fetchNotifications();
            }
          )
          .subscribe();

        channelRef.current = channel;
      } catch (error) {
        console.error(
          '[Notification realtime] Failed to setup realtime channel:',
          error
        );
      }
    };

    setupRealtime();

    // Cleanup: unsubscribe when component unmounts
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [enabled, fetchNotifications, onNewNotification]);

  return {
    isConnected: channelRef.current !== null,
  };
}
