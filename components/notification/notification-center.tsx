/**
 * NotificationCenter Component
 *
 * Modal popup displaying notifications with tab navigation and actions.
 * Provides filtering by type (All/Changelog/Messages) and batch operations.
 */
'use client';

import { Button } from '@components/ui/button';
import { Popover } from '@components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs';
import type { NotificationWithReadStatus } from '@lib/types/notification-center';
import { Check, Settings } from 'lucide-react';

import { useTranslations } from 'next-intl';

import { NotificationList } from './notification-list';

/**
 * NotificationCenter Component
 *
 * Modal popup displaying notifications with tab navigation and actions.
 * Provides filtering by type (All/Changelog/Messages) and batch operations.
 */

// ============================================================================
// Types
// ============================================================================

export interface NotificationCenterProps {
  /** All notifications */
  notifications: NotificationWithReadStatus[];
  /** Callback to mark single notification as read */
  onMarkAsRead?: (id: string) => void;
  /** Callback to mark all notifications as read */
  onMarkAllAsRead?: () => void;
  /** Callback when notification is clicked */
  onAction?: (notification: NotificationWithReadStatus) => void;
  /** Callback to navigate to settings */
  onSettingsClick?: () => void;
  /** Whether the popup is open */
  open: boolean;
  /** Callback when open state changes */
  onOpenChange: (open: boolean) => void;
  /** Trigger element (typically NotificationBell) */
  children: React.ReactNode;
  /** Loading state for initial fetch */
  isLoading?: boolean;
  /** Whether there are more notifications to load */
  hasMore?: boolean;
  /** Callback to load more notifications */
  onLoadMore?: () => void;
}

// ============================================================================
// Utils
// ============================================================================

/**
 * Filter notifications by type
 */
function filterNotificationsByType(
  notifications: NotificationWithReadStatus[],
  type: 'all' | 'changelog' | 'message'
): NotificationWithReadStatus[] {
  if (type === 'all') return notifications;
  return notifications.filter(n => n.type === type);
}

/**
 * Get unread count for specific type
 */
function getUnreadCount(
  notifications: NotificationWithReadStatus[],
  type: 'all' | 'changelog' | 'message'
): number {
  const filtered = filterNotificationsByType(notifications, type);
  return filtered.filter(n => !n.is_read).length;
}

// ============================================================================
// Component
// ============================================================================

export function NotificationCenter({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onAction,
  onSettingsClick,
  open,
  onOpenChange,
  children,
  isLoading = false,
  hasMore = false,
  onLoadMore,
}: NotificationCenterProps) {
  const t = useTranslations('notificationCenter');

  const unreadCount = getUnreadCount(notifications, 'all');
  const changelogUnreadCount = getUnreadCount(notifications, 'changelog');
  const messageUnreadCount = getUnreadCount(notifications, 'message');

  return (
    <Popover
      trigger={children}
      isOpen={open}
      onOpenChange={onOpenChange}
      minWidth={420}
      placement="bottom"
      offsetX={-180}
      offsetY={8}
      contentClassName="p-0"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h2 className="text-lg font-semibold">{t('title')}</h2>

        <div className="flex items-center gap-1">
          {/* Mark all as read */}
          {unreadCount > 0 && onMarkAllAsRead && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMarkAllAsRead}
              className="h-8 text-xs"
            >
              <Check className="mr-1 h-3 w-3" />
              {t('markAllAsRead')}
            </Button>
          )}

          {/* Settings button */}
          {onSettingsClick && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onSettingsClick}
              className="h-8 w-8"
              aria-label={t('settings')}
            >
              <Settings className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
          <TabsTrigger
            value="all"
            className="data-[state=active]:border-primary relative rounded-none border-b-2 border-transparent data-[state=active]:bg-transparent"
          >
            {t('tabs.all')}
            {unreadCount > 0 && (
              <span className="bg-primary text-primary-foreground ml-2 rounded-full px-2 py-0.5 text-xs font-semibold">
                {unreadCount}
              </span>
            )}
          </TabsTrigger>

          <TabsTrigger
            value="changelog"
            className="data-[state=active]:border-primary relative rounded-none border-b-2 border-transparent data-[state=active]:bg-transparent"
          >
            {t('tabs.changelog')}
            {changelogUnreadCount > 0 && (
              <span className="bg-primary text-primary-foreground ml-2 rounded-full px-2 py-0.5 text-xs font-semibold">
                {changelogUnreadCount}
              </span>
            )}
          </TabsTrigger>

          <TabsTrigger
            value="message"
            className="data-[state=active]:border-primary relative rounded-none border-b-2 border-transparent data-[state=active]:bg-transparent"
          >
            {t('tabs.messages')}
            {messageUnreadCount > 0 && (
              <span className="bg-primary text-primary-foreground ml-2 rounded-full px-2 py-0.5 text-xs font-semibold">
                {messageUnreadCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Tab content */}
        <div className="max-h-[600px] overflow-y-auto">
          <TabsContent value="all" className="m-0 p-4">
            <NotificationList
              notifications={notifications}
              onMarkAsRead={onMarkAsRead}
              onAction={onAction}
              groupByDate
              isLoading={isLoading}
              hasMore={hasMore}
              onLoadMore={onLoadMore}
            />
          </TabsContent>

          <TabsContent value="changelog" className="m-0 p-4">
            <NotificationList
              notifications={filterNotificationsByType(
                notifications,
                'changelog'
              )}
              onMarkAsRead={onMarkAsRead}
              onAction={onAction}
              groupByDate
              isLoading={isLoading}
              hasMore={hasMore}
              onLoadMore={onLoadMore}
            />
          </TabsContent>

          <TabsContent value="message" className="m-0 p-4">
            <NotificationList
              notifications={filterNotificationsByType(
                notifications,
                'message'
              )}
              onMarkAsRead={onMarkAsRead}
              onAction={onAction}
              groupByDate
              isLoading={isLoading}
              hasMore={hasMore}
              onLoadMore={onLoadMore}
            />
          </TabsContent>
        </div>
      </Tabs>
    </Popover>
  );
}
