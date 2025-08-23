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
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('page.title')}</h1>
          <p className="text-muted-foreground">{t('page.description')}</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            className="gap-2"
          >
            <CheckCircle2 className="h-4 w-4" />
            {t('actions.markAllRead')}
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder={t('page.searchPlaceholder')}
            value={filters.search}
            onChange={e =>
              setFilters(prev => ({ ...prev, search: e.target.value }))
            }
            className="pl-10"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3 sm:w-96">
          <TabsTrigger value="all" className="relative">
            {t('tabs.all')}
            {unreadCount.total > 0 && (
              <Badge
                variant="destructive"
                className="ml-2 h-4 min-w-4 px-1 text-[10px]"
              >
                {unreadCount.total}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="changelog" className="relative">
            {t('tabs.changelog')}
            {unreadCount.changelog > 0 && (
              <Badge className="ml-2 h-4 min-w-4 bg-blue-500 px-1 text-[10px]">
                {unreadCount.changelog}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="message" className="relative">
            {t('tabs.messages')}
            {unreadCount.message > 0 && (
              <Badge
                variant="destructive"
                className="ml-2 h-4 min-w-4 px-1 text-[10px]"
              >
                {unreadCount.message}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Tab Content */}
        <div className="mt-6">
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
  if (loading && notifications.length === 0) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4 rounded-lg border p-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="text-center">
          <p className="text-muted-foreground">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Notifications list */}
      <div className="space-y-3">
        {notifications.map(notification => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onMarkAsRead={onMarkAsRead}
            compact={false}
          />
        ))}

        {/* Load more button */}
        <div className="pt-4 text-center">
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
    </div>
  );
}

export type { NotificationPageProps };
