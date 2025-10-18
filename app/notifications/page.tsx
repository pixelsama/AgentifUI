'use client';

import { NotificationItem } from '@components/notification/notification-item';
import {
  type DateGroup,
  groupNotificationsByDate,
} from '@components/notification/notification-list';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select';
import { useNotificationStore } from '@lib/stores/notification-store';
import type { NotificationWithReadStatus } from '@lib/types/notification-center';
import { cn } from '@lib/utils';
import { Download, RefreshCw } from 'lucide-react';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useRouter } from 'next/navigation';

const PAGE_SIZE = 20;

const PRIORITY_ORDER: Record<string, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

const TYPE_OPTIONS = [
  { value: 'all', label: 'All types' },
  { value: 'changelog', label: 'Changelog' },
  { value: 'message', label: 'Message' },
] as const;

const PRIORITY_OPTIONS = [
  { value: 'all', label: 'All priorities' },
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
] as const;

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'unread', label: 'Unread only' },
  { value: 'read', label: 'Read only' },
] as const;

const SORT_OPTIONS = [
  { value: 'created_at', label: 'Date' },
  { value: 'priority', label: 'Priority' },
  { value: 'title', label: 'Title' },
] as const;

const CATEGORY_OPTIONS = [
  { value: 'feature', label: 'Feature updates', type: 'changelog' },
  { value: 'improvement', label: 'Improvements', type: 'changelog' },
  { value: 'bugfix', label: 'Bug fixes', type: 'changelog' },
  { value: 'security', label: 'Security', type: 'changelog' },
  { value: 'api_change', label: 'API changes', type: 'changelog' },
  {
    value: 'admin_announcement',
    label: 'Admin announcements',
    type: 'message',
  },
  { value: 'agent_result', label: 'Agent results', type: 'message' },
  { value: 'token_usage', label: 'Token usage', type: 'message' },
  { value: 'system_maintenance', label: 'System maintenance', type: 'message' },
  { value: 'security_alert', label: 'Security alerts', type: 'message' },
  { value: 'feature_tip', label: 'Feature tips', type: 'message' },
] as const;

const DATE_LABELS: Record<string, string> = {
  today: 'Today',
  yesterday: 'Yesterday',
  thisWeek: 'This Week',
  thisMonth: 'This Month',
};

type TypeValue = (typeof TYPE_OPTIONS)[number]['value'];
type PriorityValue = (typeof PRIORITY_OPTIONS)[number]['value'];
type StatusValue = (typeof STATUS_OPTIONS)[number]['value'];
type SortValue = (typeof SORT_OPTIONS)[number]['value'];

interface DateRange {
  start: string;
  end: string;
}

function normalizeStartDate(value: string) {
  return new Date(`${value}T00:00:00.000`);
}

function normalizeEndDate(value: string) {
  return new Date(`${value}T23:59:59.999`);
}

function downloadCsv(notifications: NotificationWithReadStatus[]) {
  const header = [
    'Title',
    'Content',
    'Type',
    'Category',
    'Priority',
    'Status',
    'Created At',
  ].join(',');

  const rows = notifications.map(notification => {
    const values = [
      notification.title,
      notification.content.replace(/\s+/g, ' ').trim(),
      notification.type,
      notification.category ?? '',
      notification.priority,
      notification.is_read ? 'read' : 'unread',
      notification.created_at,
    ];

    return values.map(value => `"${value.replace(/"/g, '""')}"`).join(',');
  });

  const csvContent = [header, ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `notifications-${Date.now()}.csv`);
  link.click();

  URL.revokeObjectURL(url);
}

export default function NotificationsPage() {
  const router = useRouter();

  const notifications = useNotificationStore(state => state.notifications);
  const fetchNotifications = useNotificationStore(
    state => state.fetchNotifications
  );
  const markAsRead = useNotificationStore(state => state.markAsRead);
  const hasMore = useNotificationStore(state => state.hasMore);
  const isLoading = useNotificationStore(state => state.isLoading);

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeValue>('all');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priorityFilter, setPriorityFilter] = useState<PriorityValue>('all');
  const [statusFilter, setStatusFilter] = useState<StatusValue>('all');
  const [sortKey, setSortKey] = useState<SortValue>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [dateRange, setDateRange] = useState<DateRange>({ start: '', end: '' });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());

  const observerTarget = useRef<HTMLDivElement>(null);

  const serverCategory =
    selectedCategories.length === 1 ? selectedCategories[0] : undefined;

  const fetchParams = useMemo(() => {
    const params: Record<string, unknown> = {
      limit: PAGE_SIZE,
      sort_by: sortKey === 'priority' ? 'priority' : 'created_at',
      sort_order: sortOrder,
    };

    if (typeFilter !== 'all') {
      params.type = typeFilter;
    }

    if (priorityFilter !== 'all') {
      params.priority = priorityFilter;
    }

    if (statusFilter === 'unread') {
      params.include_read = false;
    }

    if (serverCategory) {
      params.category = serverCategory;
    }

    return params;
  }, [
    typeFilter,
    priorityFilter,
    statusFilter,
    serverCategory,
    sortKey,
    sortOrder,
  ]);

  useEffect(() => {
    fetchNotifications(fetchParams, false);
    setSelectedIds(new Set());
  }, [fetchNotifications, fetchParams]);

  const handleLoadMore = useCallback(() => {
    if (isLoading) return;
    fetchNotifications(fetchParams, true);
  }, [fetchNotifications, fetchParams, isLoading]);

  useEffect(() => {
    if (!hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting) {
          handleLoadMore();
        }
      },
      { threshold: 0.25 }
    );

    const target = observerTarget.current;
    if (target) {
      observer.observe(target);
    }

    return () => {
      if (target) {
        observer.unobserve(target);
      }
    };
  }, [handleLoadMore, hasMore, isLoading]);

  const handleToggleCategory = useCallback((category: string) => {
    setSelectedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return Array.from(next);
    });
  }, []);

  const handleResetFilters = useCallback(() => {
    setSearchTerm('');
    setTypeFilter('all');
    setSelectedCategories([]);
    setPriorityFilter('all');
    setStatusFilter('all');
    setSortKey('created_at');
    setSortOrder('desc');
    setDateRange({ start: '', end: '' });
    setSelectedIds(new Set());
  }, []);

  const filtersChanged = useMemo(() => {
    return (
      typeFilter !== 'all' ||
      selectedCategories.length > 0 ||
      priorityFilter !== 'all' ||
      statusFilter !== 'all' ||
      sortKey !== 'created_at' ||
      sortOrder !== 'desc' ||
      searchTerm.trim().length > 0 ||
      dateRange.start !== '' ||
      dateRange.end !== ''
    );
  }, [
    typeFilter,
    selectedCategories,
    priorityFilter,
    statusFilter,
    sortKey,
    sortOrder,
    searchTerm,
    dateRange,
  ]);

  const startDate = dateRange.start
    ? normalizeStartDate(dateRange.start)
    : null;
  const endDate = dateRange.end ? normalizeEndDate(dateRange.end) : null;

  const filteredNotifications = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return notifications
      .filter(notification => {
        if (typeFilter !== 'all' && notification.type !== typeFilter) {
          return false;
        }

        if (
          selectedCategories.length > 0 &&
          (!notification.category ||
            !selectedCategories.includes(notification.category))
        ) {
          return false;
        }

        if (
          priorityFilter !== 'all' &&
          notification.priority !== priorityFilter
        ) {
          return false;
        }

        if (statusFilter === 'read' && !notification.is_read) {
          return false;
        }

        if (statusFilter === 'unread' && notification.is_read) {
          return false;
        }

        if (startDate) {
          const createdAt = new Date(notification.created_at);
          if (createdAt < startDate) {
            return false;
          }
        }

        if (endDate) {
          const createdAt = new Date(notification.created_at);
          if (createdAt > endDate) {
            return false;
          }
        }

        if (term.length > 0) {
          const combined =
            `${notification.title} ${notification.content}`.toLowerCase();
          if (!combined.includes(term)) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortKey === 'title') {
          const comparison = a.title.localeCompare(b.title);
          return sortOrder === 'asc' ? comparison : -comparison;
        }

        if (sortKey === 'priority') {
          const weightA = PRIORITY_ORDER[a.priority] ?? 0;
          const weightB = PRIORITY_ORDER[b.priority] ?? 0;
          const comparison = weightA - weightB;
          return sortOrder === 'asc' ? comparison : -comparison;
        }

        const timeA = new Date(a.created_at).getTime();
        const timeB = new Date(b.created_at).getTime();
        const comparison = timeA - timeB;
        return sortOrder === 'asc' ? comparison : -comparison;
      });
  }, [
    notifications,
    typeFilter,
    selectedCategories,
    priorityFilter,
    statusFilter,
    startDate,
    endDate,
    searchTerm,
    sortKey,
    sortOrder,
  ]);

  const groupedNotifications: DateGroup[] = useMemo(() => {
    return groupNotificationsByDate(filteredNotifications);
  }, [filteredNotifications]);

  const handleToggleSelection = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedIds.size === filteredNotifications.length) {
      setSelectedIds(new Set());
      return;
    }

    setSelectedIds(
      new Set(filteredNotifications.map(notification => notification.id))
    );
  }, [filteredNotifications, selectedIds]);

  const handleClearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const handleMarkSelectedAsRead = useCallback(async () => {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    await markAsRead(ids);
    setSelectedIds(new Set());
  }, [markAsRead, selectedIds]);

  const handleSingleMarkAsRead = useCallback(
    (id: string) => {
      void markAsRead([id]);
    },
    [markAsRead]
  );

  const handleExportCsv = useCallback(() => {
    if (filteredNotifications.length === 0) return;
    downloadCsv(filteredNotifications);
  }, [filteredNotifications]);

  const handleNotificationAction = useCallback(
    (notification: NotificationWithReadStatus) => {
      const metadata = notification.metadata as
        | Record<string, unknown>
        | undefined;

      const candidateKeys = ['href', 'url', 'link', 'path'] as const;
      const target = candidateKeys
        .map(key => metadata?.[key])
        .find(value => typeof value === 'string' && value.trim().length > 0) as
        | string
        | undefined;

      if (!target) return;

      const trimmed = target.trim();
      if (/^https?:\/\//i.test(trimmed)) {
        window.open(trimmed, '_blank', 'noopener,noreferrer');
      } else {
        router.push(trimmed);
      }
    },
    [router]
  );

  const selectedCount = selectedIds.size;
  const totalVisible = filteredNotifications.length;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 lg:px-8">
      <div className="flex flex-col gap-4 border-b pb-4">
        <div>
          <h1 className="text-3xl font-semibold">Notifications</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Review product updates, announcements, and alerts without leaving
            this page.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Input
            value={searchTerm}
            onChange={event => setSearchTerm(event.target.value)}
            placeholder="Search by title or content"
            className="sm:max-w-md"
          />
          <div className="flex items-center gap-3">
            <Select
              value={sortKey}
              onValueChange={value => setSortKey(value as SortValue)}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={sortOrder}
              onValueChange={value => setSortOrder(value as 'asc' | 'desc')}
            >
              <SelectTrigger className="w-28">
                <SelectValue placeholder="Order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Desc</SelectItem>
                <SelectItem value="asc">Asc</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-6 rounded-xl border bg-white/70 p-4 shadow-sm dark:bg-stone-900/60">
          <div className="space-y-2">
            <h2 className="font-medium">Type</h2>
            <Select
              value={typeFilter}
              onValueChange={value => setTypeFilter(value as TypeValue)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {TYPE_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <h2 className="font-medium">Categories</h2>
            <div className="flex flex-col gap-2 text-sm">
              {CATEGORY_OPTIONS.map(option => {
                if (typeFilter !== 'all' && option.type !== typeFilter) {
                  return null;
                }

                const checked = selectedCategories.includes(option.value);

                return (
                  <label
                    key={option.value}
                    className={cn(
                      'flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 transition-colors',
                      checked
                        ? 'border-primary/60 bg-primary/10 text-primary'
                        : 'border-transparent hover:border-stone-200 hover:bg-stone-100/60 dark:hover:border-stone-700 dark:hover:bg-stone-800/60'
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleToggleCategory(option.value)}
                      className="accent-primary h-4 w-4"
                    />
                    <span>{option.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="font-medium">Priority</h2>
            <Select
              value={priorityFilter}
              onValueChange={value => setPriorityFilter(value as PriorityValue)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                {PRIORITY_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <h2 className="font-medium">Status</h2>
            <Select
              value={statusFilter}
              onValueChange={value => setStatusFilter(value as StatusValue)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <h2 className="font-medium">Date range</h2>
            <div className="grid gap-2">
              <Input
                type="date"
                value={dateRange.start}
                onChange={event =>
                  setDateRange(range => ({
                    ...range,
                    start: event.target.value,
                  }))
                }
                max={dateRange.end || undefined}
              />
              <Input
                type="date"
                value={dateRange.end}
                onChange={event =>
                  setDateRange(range => ({
                    ...range,
                    end: event.target.value,
                  }))
                }
                min={dateRange.start || undefined}
              />
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center"
            onClick={handleResetFilters}
            disabled={!filtersChanged}
          >
            <RefreshCw className="h-4 w-4" />
            Reset filters
          </Button>
        </aside>

        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-white/70 p-4 shadow-sm dark:bg-stone-900/60">
            <div className="text-sm">
              <span className="font-medium">{selectedCount}</span> selected
              <span className="text-muted-foreground"> of {totalVisible}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleSelectAll}
                disabled={totalVisible === 0}
              >
                {selectedCount === totalVisible && totalVisible > 0
                  ? 'Deselect all'
                  : 'Select all'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearSelection}
                disabled={selectedCount === 0}
              >
                Clear selection
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkSelectedAsRead}
                disabled={selectedCount === 0}
              >
                Mark selected read
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExportCsv}
                disabled={totalVisible === 0}
              >
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>

          {filtersChanged && (
            <div className="text-muted-foreground text-xs">
              Filters applied. Reset to show all notifications.
            </div>
          )}

          <div className="space-y-8">
            {groupedNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-white/70 p-12 text-center dark:bg-stone-900/40">
                <h3 className="text-lg font-medium">No notifications found</h3>
                <p className="text-muted-foreground mt-2 text-sm">
                  Adjust the filters or clear them to view every notification.
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-4"
                  onClick={handleResetFilters}
                >
                  Reset filters
                </Button>
              </div>
            ) : (
              groupedNotifications.map(group => (
                <section key={group.label} className="space-y-4">
                  <div className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                    {DATE_LABELS[group.label] ?? group.label}
                  </div>
                  <div className="space-y-3">
                    {group.notifications.map(notification => {
                      const isSelected = selectedIds.has(notification.id);
                      return (
                        <div
                          key={notification.id}
                          className={cn(
                            'flex items-start gap-3 rounded-xl border bg-white/80 p-3 transition-colors dark:bg-stone-900/60',
                            isSelected &&
                              'border-primary/70 ring-primary/40 ring-2'
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() =>
                              handleToggleSelection(notification.id)
                            }
                            className="accent-primary mt-2 h-4 w-4"
                          />
                          <div className="flex-1">
                            <NotificationItem
                              notification={notification}
                              onMarkAsRead={handleSingleMarkAsRead}
                              onAction={handleNotificationAction}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              ))
            )}
          </div>

          <div ref={observerTarget} className="h-1" />

          {hasMore && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLoadMore}
                isLoading={isLoading}
              >
                Load more
              </Button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
