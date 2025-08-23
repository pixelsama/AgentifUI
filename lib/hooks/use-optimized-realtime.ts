'use client';

import { debounce, throttle } from 'lodash';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import NotificationPushService from '../services/notification-push-service';
import { useNotificationCenter } from '../stores/notification-center-store';
import { createClient } from '../supabase/client';
import { useSupabaseAuth } from '../supabase/hooks';
import type { NotificationWithReadStatus } from '../types/notification-center';

interface OptimizedRealtimeConfig {
  enableAutoRefresh?: boolean;
  enablePushNotifications?: boolean;
  enableSound?: boolean;
  enableDesktopNotifications?: boolean;
  debounceDelay?: number;
  throttleDelay?: number;
  batchSize?: number;
  maxRetries?: number;
}

interface RealtimeStats {
  totalNotifications: number;
  connectionAttempts: number;
  lastUpdate: Date | null;
  errors: number;
  isHealthy: boolean;
}

/**
 * Optimized real-time notification hook with performance enhancements
 *
 * Features:
 * - Debounced unread count updates
 * - Throttled real-time event processing
 * - Batch notification handling
 * - Connection health monitoring
 * - Automatic retry logic
 * - Memory leak prevention
 */
export function useOptimizedRealtime(config: OptimizedRealtimeConfig = {}) {
  const {
    enableAutoRefresh = true,
    enablePushNotifications = true,
    enableSound = false,
    enableDesktopNotifications = false,
    debounceDelay = 500,
    throttleDelay = 200,
    batchSize = 5,
    maxRetries = 3,
  } = config;

  const supabase = createClient();
  const { user } = useSupabaseAuth();
  const notificationCenter = useNotificationCenter();

  // State for connection monitoring
  const [stats, setStats] = useState<RealtimeStats>({
    totalNotifications: 0,
    connectionAttempts: 0,
    lastUpdate: null,
    errors: 0,
    isHealthy: true,
  });

  // Refs for cleanup and batching
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const retryCountRef = useRef(0);
  const notificationBatchRef = useRef<NotificationWithReadStatus[]>([]);
  const batchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const throttledEventHandlerRef = useRef<ReturnType<typeof throttle> | null>(
    null
  );

  // Debounced unread count update to avoid excessive API calls
  const debouncedUpdateCount = useMemo(
    () =>
      debounce(async () => {
        try {
          await notificationCenter.refreshUnreadCount();
          setStats(prev => ({
            ...prev,
            lastUpdate: new Date(),
            isHealthy: true,
          }));
        } catch (error) {
          console.error('Failed to update unread count:', error);
          setStats(prev => ({
            ...prev,
            errors: prev.errors + 1,
            isHealthy: prev.errors < 3, // Mark unhealthy after 3 consecutive errors
          }));
        }
      }, debounceDelay),
    [notificationCenter, debounceDelay]
  );

  // Throttled event handler to prevent excessive processing
  const throttledEventHandler = useMemo(() => {
    const throttledFn = throttle(
      (notifications: NotificationWithReadStatus[]) => {
        try {
          // Process notifications in batch
          notifications.forEach(notification => {
            notificationCenter._addNotification(notification);

            // Push notification if enabled
            if (enablePushNotifications) {
              NotificationPushService.pushNotification(notification, {
                showInBar: true,
                enableSound,
                enableDesktopNotification: enableDesktopNotifications,
              });
            }
          });

          // Update stats
          setStats(prev => ({
            ...prev,
            totalNotifications: prev.totalNotifications + notifications.length,
            lastUpdate: new Date(),
            isHealthy: true,
          }));

          // Trigger debounced unread count update
          debouncedUpdateCount();
        } catch (error) {
          console.error('Error processing notification batch:', error);
          setStats(prev => ({
            ...prev,
            errors: prev.errors + 1,
            isHealthy: false,
          }));
        }
      },
      throttleDelay
    );

    throttledEventHandlerRef.current = throttledFn;
    return throttledFn;
  }, [
    notificationCenter,
    enablePushNotifications,
    enableSound,
    enableDesktopNotifications,
    debouncedUpdateCount,
    throttleDelay,
  ]);

  // Batch notification processor
  const processBatch = useCallback(() => {
    if (notificationBatchRef.current.length > 0) {
      const batch = [...notificationBatchRef.current];
      notificationBatchRef.current = [];
      throttledEventHandler(batch);
    }
  }, [throttledEventHandler]);

  // Add notification to batch
  const addToBatch = useCallback(
    (notification: NotificationWithReadStatus) => {
      notificationBatchRef.current.push(notification);

      // Process immediately if batch is full
      if (notificationBatchRef.current.length >= batchSize) {
        if (batchTimeoutRef.current) {
          clearTimeout(batchTimeoutRef.current);
          batchTimeoutRef.current = null;
        }
        processBatch();
      } else {
        // Schedule batch processing
        if (batchTimeoutRef.current) {
          clearTimeout(batchTimeoutRef.current);
        }
        batchTimeoutRef.current = setTimeout(processBatch, 100);
      }
    },
    [batchSize, processBatch]
  );

  // Handle notification insert with batching
  const handleNotificationInsert = useCallback(
    (payload: { new: NotificationWithReadStatus }) => {
      console.log('New notification received:', payload.new.title);
      addToBatch(payload.new);
    },
    [addToBatch]
  );

  // Handle notification update
  const handleNotificationUpdate = useCallback(
    (payload: { new: NotificationWithReadStatus }) => {
      console.log('Notification updated:', payload.new.title);
      notificationCenter._updateNotification(payload.new.id, payload.new);
      debouncedUpdateCount();
    },
    [notificationCenter, debouncedUpdateCount]
  );

  // Handle notification delete
  const handleNotificationDelete = useCallback(
    (payload: { old: NotificationWithReadStatus }) => {
      console.log('Notification deleted:', payload.old.id);
      notificationCenter._removeNotification(payload.old.id);
      debouncedUpdateCount();
    },
    [notificationCenter, debouncedUpdateCount]
  );

  // Handle read status change
  const handleReadStatusChange = useCallback(
    (payload: {
      new: { notification_id: string; user_id: string; read_at: string };
    }) => {
      const { notification_id, user_id, read_at } = payload.new;

      // Only process if it's for the current user
      if (user?.id === user_id) {
        console.log('Notification marked as read:', notification_id);
        notificationCenter._updateNotification(notification_id, {
          is_read: true,
          read_at,
        });
        debouncedUpdateCount();
      }
    },
    [user?.id, notificationCenter, debouncedUpdateCount]
  );

  // Connection setup with retry logic
  const setupConnection = useCallback(async () => {
    if (!user?.id || channelRef.current) {
      return;
    }

    try {
      setStats(prev => ({
        ...prev,
        connectionAttempts: prev.connectionAttempts + 1,
      }));

      console.log(
        'Setting up optimized real-time connection for user:',
        user.id
      );

      /* eslint-disable @typescript-eslint/no-explicit-any */
      const channel = supabase
        .channel(`optimized-notifications-${user.id}`)
        .on(
          'postgres_changes' as any,
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `target_users=cs.{${user.id}}`,
          },
          handleNotificationInsert
        )
        .on(
          'postgres_changes' as any,
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'notifications',
            filter: `target_users=cs.{${user.id}}`,
          },
          handleNotificationUpdate
        )
        .on(
          'postgres_changes' as any,
          {
            event: 'DELETE',
            schema: 'public',
            table: 'notifications',
            filter: `target_users=cs.{${user.id}}`,
          },
          handleNotificationDelete
        )
        .on(
          'postgres_changes' as any,
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notification_reads',
            filter: `user_id=eq.${user.id}`,
          },
          handleReadStatusChange
        )
        /* eslint-enable @typescript-eslint/no-explicit-any */
        .subscribe(status => {
          console.log('Optimized subscription status:', status);

          if (status === 'SUBSCRIBED') {
            retryCountRef.current = 0;
            setStats(prev => ({ ...prev, isHealthy: true, errors: 0 }));
          } else if (status === 'CHANNEL_ERROR') {
            setStats(prev => ({
              ...prev,
              isHealthy: false,
              errors: prev.errors + 1,
            }));

            // Retry connection if not exceeded max retries
            if (retryCountRef.current < maxRetries) {
              retryCountRef.current++;
              console.log(
                `Retrying connection, attempt ${retryCountRef.current}`
              );
              setTimeout(() => {
                if (channelRef.current) {
                  supabase.removeChannel(channelRef.current);
                  channelRef.current = null;
                }
                setupConnection();
              }, 1000 * retryCountRef.current); // Exponential backoff
            }
          }
        });

      channelRef.current = channel;
    } catch (error) {
      console.error('Failed to setup real-time connection:', error);
      setStats(prev => ({
        ...prev,
        isHealthy: false,
        errors: prev.errors + 1,
      }));
    }
  }, [
    user?.id,
    supabase,
    handleNotificationInsert,
    handleNotificationUpdate,
    handleNotificationDelete,
    handleReadStatusChange,
    maxRetries,
  ]);

  // Cleanup function
  const cleanup = useCallback(() => {
    // Clear timers
    if (batchTimeoutRef.current) {
      clearTimeout(batchTimeoutRef.current);
      batchTimeoutRef.current = null;
    }

    // Process any remaining notifications in batch
    if (notificationBatchRef.current.length > 0) {
      processBatch();
    }

    // Remove channel
    if (channelRef.current) {
      console.log('Cleaning up optimized real-time connection');
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    // Cancel debounced/throttled functions
    debouncedUpdateCount.cancel();
    if (throttledEventHandlerRef.current) {
      throttledEventHandlerRef.current.cancel();
    }
  }, [supabase, processBatch, debouncedUpdateCount]);

  // Setup connection effect
  useEffect(() => {
    if (user?.id) {
      setupConnection();

      // Initial data fetch if auto-refresh is enabled
      if (enableAutoRefresh) {
        notificationCenter.refreshUnreadCount();
      }
    } else {
      cleanup();
    }

    return cleanup;
  }, [
    user?.id,
    setupConnection,
    cleanup,
    enableAutoRefresh,
    notificationCenter,
  ]);

  // Heartbeat for connection health monitoring
  useEffect(() => {
    if (!user?.id) return;

    const heartbeat = setInterval(() => {
      if (channelRef.current) {
        // Simple health check - could be enhanced with ping/pong
        const timeSinceLastUpdate = stats.lastUpdate
          ? Date.now() - stats.lastUpdate.getTime()
          : Infinity;

        // Consider connection unhealthy if no updates in 5 minutes
        if (timeSinceLastUpdate > 5 * 60 * 1000) {
          setStats(prev => ({ ...prev, isHealthy: false }));
        }
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(heartbeat);
  }, [user?.id, stats.lastUpdate]);

  // Public API for manual actions
  const forceRefresh = useCallback(async () => {
    try {
      await notificationCenter.refreshUnreadCount();
      const type =
        notificationCenter.activeTab === 'all'
          ? undefined
          : (notificationCenter.activeTab as 'changelog' | 'message');
      await notificationCenter.fetchNotifications(type, true);
    } catch (error) {
      console.error('Failed to force refresh:', error);
    }
  }, [notificationCenter]);

  const reconnect = useCallback(() => {
    cleanup();
    retryCountRef.current = 0;
    setTimeout(setupConnection, 1000);
  }, [cleanup, setupConnection]);

  return {
    // Connection status
    isConnected: !!channelRef.current,
    isHealthy: stats.isHealthy,
    stats,

    // Manual actions
    forceRefresh,
    reconnect,

    // Batch status
    pendingBatchSize: notificationBatchRef.current.length,
  };
}

export default useOptimizedRealtime;
