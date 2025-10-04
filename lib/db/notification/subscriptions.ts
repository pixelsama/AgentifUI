/**
 * Notification Real-time Subscription Operations
 *
 * Operations for subscribing to real-time notification updates and read status changes.
 *
 * @todo This module is a placeholder and will be implemented in a future PR
 * @see https://github.com/ifLabX/AgentifUI/issues/243
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
import type {
  Notification,
  NotificationRead,
} from '@lib/types/notification-center';

/**
 * Subscribe to real-time notification changes
 *
 * @todo Implementation pending - will be added in next PR
 * @param _userId - User ID to subscribe for
 * @param _callbacks - Callbacks for notification events
 * @returns Unsubscribe function
 */
export function subscribeToNotifications(
  _userId: string,
  _callbacks?: {
    onInsert?: (notification: Notification) => void;
    onUpdate?: (notification: Notification) => void;
    onDelete?: (notification: Notification) => void;
    onError?: (error: Error) => void;
  }
): () => void {
  // TODO: Implement real-time subscription using Supabase realtime
  console.warn('subscribeToNotifications is not yet implemented');
  return () => {
    // Cleanup function placeholder
  };
}

/**
 * Subscribe to real-time read status changes
 *
 * @todo Implementation pending - will be added in next PR
 * @param _userId - User ID to subscribe for
 * @param _callbacks - Callbacks for read status events
 * @returns Unsubscribe function
 */
export function subscribeToReadStatus(
  _userId: string,
  _callbacks?: {
    onRead?: (read: NotificationRead) => void;
    onError?: (error: Error) => void;
  }
): () => void {
  // TODO: Implement real-time subscription using Supabase realtime
  console.warn('subscribeToReadStatus is not yet implemented');
  return () => {
    // Cleanup function placeholder
  };
}
