'use client';

import { NotificationList } from '@components/notification/notification-list';
import { Button } from '@components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@components/ui/tabs';
import { useNotificationStore } from '@lib/stores/notification-store';
import { useSidebarStore } from '@lib/stores/sidebar-store';
import type { NotificationTab } from '@lib/types/notification-center';
import { cn } from '@lib/utils';
import { Bell } from 'lucide-react';

import { useCallback, useEffect, useMemo } from 'react';

import { useTranslations } from 'next-intl';

const TAB_ITEMS: Array<{
  value: NotificationTab;
  labelKey: 'all' | 'changelog' | 'messages';
}> = [
  { value: 'all', labelKey: 'all' },
  { value: 'changelog', labelKey: 'changelog' },
  { value: 'message', labelKey: 'messages' },
];

export default function NotificationsPage() {
  const tPage = useTranslations('pages.notifications');
  const tTabs = useTranslations('components.notificationCenter.tabs');
  const tList = useTranslations('components.notificationList');

  const { isExpanded } = useSidebarStore();
  const {
    notifications,
    fetchNotifications,
    loadMore,
    hasMore,
    markAsRead,
    isLoading,
    activeTab,
    setActiveTab,
  } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const sidebarPaddingClass = useMemo(
    () => (isExpanded ? 'md:pl-64 xl:pl-72' : 'md:pl-16 lg:pl-20'),
    [isExpanded]
  );

  const handleTabChange = useCallback(
    (value: string) => {
      setActiveTab(value as NotificationTab);
    },
    [setActiveTab]
  );

  const handleMarkAsRead = useCallback(
    (id: string) => {
      void markAsRead([id]);
    },
    [markAsRead]
  );

  const handleLoadMore = useCallback(() => {
    void loadMore();
  }, [loadMore]);

  const shouldShowEmpty = !isLoading && notifications.length === 0;

  return (
    <div
      className={cn(
        'min-h-screen bg-stone-100/60 px-4 pt-24 pb-16 transition-[padding] duration-200 dark:bg-stone-900/40',
        sidebarPaddingClass
      )}
    >
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-8 text-center">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold">{tPage('title')}</h1>
        </header>

        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="inline-flex h-10 items-center space-x-2 rounded-lg bg-stone-200 p-1 dark:bg-stone-700">
            {TAB_ITEMS.map(tab => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="rounded-md px-4 py-1.5 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100 data-[state=active]:text-stone-900 dark:text-stone-300 dark:hover:bg-stone-600 dark:data-[state=active]:bg-stone-500 dark:data-[state=active]:text-white"
              >
                {tTabs(tab.labelKey)}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {shouldShowEmpty ? (
          <div className="text-muted-foreground flex flex-1 flex-col items-center justify-center gap-3 py-24">
            <Bell className="h-12 w-12" />
            <div className="space-y-1">
              <p className="text-lg font-medium">{tPage('empty.title')}</p>
              <p className="text-sm">{tPage('empty.description')}</p>
            </div>
          </div>
        ) : (
          <div className="w-full space-y-6 text-left">
            <NotificationList
              notifications={notifications}
              onMarkAsRead={handleMarkAsRead}
              isLoading={isLoading && notifications.length === 0}
            />

            {hasMore && (
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLoadMore}
                  isLoading={isLoading}
                >
                  {tList('loadMore')}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
