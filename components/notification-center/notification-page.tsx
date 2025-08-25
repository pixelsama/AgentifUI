'use client';

import { cn } from '@lib/utils';
import { CheckCircle2, Search } from 'lucide-react';

import { useEffect, useState } from 'react';

import { useTranslations } from 'next-intl';

import {
  type ActiveTab,
  type NotificationWithReadStatus,
  useNotificationCenter,
  useNotificationList,
  useNotificationLoading,
  useNotificationRealtime,
  useUnreadCount,
} from '../../lib/stores/notification';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Skeleton } from '../ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { DateGroupHeader } from './date-group-header';
import { NotificationItem } from './notification-item';

interface NotificationPageProps {
  className?: string;
}

interface NotificationFilters {
  search: string;
}

export function NotificationPage({ className }: NotificationPageProps) {
  const t = useTranslations('components.notificationCenter');

  // State
  const [activeTab, setActiveTab] = useState<ActiveTab>('all');
  const [filters, setFilters] = useState<NotificationFilters>({
    search: '',
  });

  // Store hooks
  const notifications = useNotificationList();
  const unreadCount = useUnreadCount();
  const loading = useNotificationLoading();

  // Get store actions
  const {
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    loadMore,
    setActiveTab: setStoreActiveTab,
  } = useNotificationCenter();

  // Set up real-time updates
  useNotificationRealtime({
    enableAutoShow: false, // Don't show popups on the full page
    enableDesktopNotifications: true,
  });

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    // Tab filter
    if (activeTab !== 'all' && notification.type !== activeTab) return false;

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      return (
        notification.title.toLowerCase().includes(searchTerm) ||
        notification.content.toLowerCase().includes(searchTerm)
      );
    }

    return true;
  });

  // Load notifications when component mounts or tab changes
  useEffect(() => {
    const type = activeTab === 'all' ? undefined : activeTab;
    fetchNotifications(type, true);
    setStoreActiveTab(activeTab);
  }, [activeTab, fetchNotifications, setStoreActiveTab]);

  // Handlers
  const handleTabChange = (value: string) => {
    setActiveTab(value as ActiveTab);
  };

  const handleMarkAsRead = (id: string) => {
    markAsRead([id]);
  };

  const handleMarkAllRead = () => {
    const type = activeTab === 'all' ? undefined : activeTab;
    markAllAsRead(type);
  };

  const handleLoadMore = () => {
    loadMore();
  };

  return (
    <div className={cn('space-y-8', className)}>
      {/* Centered Title */}
      <div className="text-center">
        <h1
          id="notification-overlay-title"
          className="text-3xl font-bold tracking-tight"
        >
          {t('page.title')}
        </h1>
      </div>

      {/* Centered Search */}
      <div className="flex justify-center">
        <div className="relative w-full max-w-md">
          <Search className="text-muted-foreground absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2" />
          <Input
            placeholder={t('page.searchPlaceholder')}
            value={filters.search}
            onChange={e =>
              setFilters(prev => ({ ...prev, search: e.target.value }))
            }
            className="border-border/50 h-12 rounded-xl pl-12 text-base"
          />
        </div>
      </div>

      {/* Tabs with Mark All Read Button */}
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <div className="flex items-center justify-between">
          <TabsList className="bg-muted/30 grid h-12 grid-cols-3 rounded-xl p-1">
            <TabsTrigger
              value="all"
              className="relative rounded-lg text-base font-medium"
            >
              {t('tabs.all')}
              {unreadCount.total > 0 && (
                <Badge
                  variant="destructive"
                  className="ml-2 h-5 min-w-5 px-2 text-xs"
                >
                  {unreadCount.total}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="changelog"
              className="relative rounded-lg text-base font-medium"
            >
              {t('tabs.changelog')}
              {unreadCount.changelog > 0 && (
                <Badge className="ml-2 h-5 min-w-5 bg-blue-500 px-2 text-xs">
                  {unreadCount.changelog}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="message"
              className="relative rounded-lg text-base font-medium"
            >
              {t('tabs.messages')}
              {unreadCount.message > 0 && (
                <Badge
                  variant="destructive"
                  className="ml-2 h-5 min-w-5 px-2 text-xs"
                >
                  {unreadCount.message}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <Button
            variant="outline"
            size="default"
            onClick={handleMarkAllRead}
            className="gap-2 px-4"
          >
            <CheckCircle2 className="h-4 w-4" />
            {t('actions.markAllRead')}
          </Button>
        </div>

        {/* Tab Content */}
        <div className="mt-8">
          <TabsContent value={activeTab} className="m-0">
            <NotificationPageContent
              notifications={filteredNotifications}
              loading={loading}
              onMarkAsRead={handleMarkAsRead}
              onLoadMore={handleLoadMore}
              emptyMessage={
                activeTab === 'all'
                  ? t('empty.all')
                  : activeTab === 'changelog'
                    ? t('empty.changelog')
                    : t('empty.messages')
              }
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

// Page content component
interface NotificationPageContentProps {
  notifications: NotificationWithReadStatus[];
  loading: boolean;
  onMarkAsRead: (id: string) => void;
  onLoadMore: () => void;
  emptyMessage: string;
}

function NotificationPageContent({
  notifications,
  loading,
  onMarkAsRead,
  onLoadMore,
  emptyMessage,
}: NotificationPageContentProps) {
  // Group notifications by date
  const groupNotificationsByDate = (
    notifications: NotificationWithReadStatus[]
  ) => {
    const grouped: Record<string, NotificationWithReadStatus[]> = {};

    notifications.forEach(notification => {
      const date = new Date(
        notification.published_at || notification.created_at
      );
      const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD format

      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(notification);
    });

    // Sort dates in descending order (newest first)
    const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

    return sortedDates.map(date => ({
      date,
      notifications: grouped[date],
    }));
  };

  if (loading && notifications.length === 0) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, groupIndex) => (
          <div key={groupIndex} className="space-y-4">
            <Skeleton className="h-6 w-32" />
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="bg-card rounded-xl border p-6 shadow-sm">
                <div className="flex gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="text-center">
          <p className="text-muted-foreground text-lg">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  const groupedNotifications = groupNotificationsByDate(notifications);

  return (
    <div className="space-y-8">
      {/* Grouped notifications */}
      {groupedNotifications.map(
        ({ date, notifications: groupNotifications }) => (
          <div key={date} className="space-y-4">
            <DateGroupHeader date={date} />
            <div className="space-y-4">
              {groupNotifications.map(notification => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={onMarkAsRead}
                  compact={false}
                />
              ))}
            </div>
          </div>
        )
      )}

      {/* Load more button */}
      <div className="pt-6 text-center">
        <Button
          variant="outline"
          onClick={onLoadMore}
          disabled={loading}
          className="min-w-32"
        >
          {loading ? '加载中...' : '加载更多'}
        </Button>
      </div>
    </div>
  );
}

export type { NotificationPageProps };
