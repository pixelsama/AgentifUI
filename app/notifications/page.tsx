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
import { useSidebarStore } from '@lib/stores/sidebar-store';
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

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

const CATEGORY_DEFINITIONS = [
  { value: 'feature', type: 'changelog' },
  { value: 'improvement', type: 'changelog' },
  { value: 'bugfix', type: 'changelog' },
  { value: 'security', type: 'changelog' },
  { value: 'api_change', type: 'changelog' },
  { value: 'admin_announcement', type: 'message' },
  { value: 'agent_result', type: 'message' },
  { value: 'token_usage', type: 'message' },
  { value: 'system_maintenance', type: 'message' },
  { value: 'security_alert', type: 'message' },
  { value: 'feature_tip', type: 'message' },
] as const;

const TYPE_FILTER_VALUES = ['all', 'changelog', 'message'] as const;
const PRIORITY_FILTER_VALUES = [
  'all',
  'critical',
  'high',
  'medium',
  'low',
] as const;
const STATUS_FILTER_VALUES = ['all', 'unread', 'read'] as const;
const SORT_BY_VALUES = ['created_at', 'priority', 'title'] as const;
const SORT_ORDER_VALUES = ['desc', 'asc'] as const;
const DATE_GROUP_KEYS = [
  'today',
  'yesterday',
  'thisWeek',
  'thisMonth',
] as const;
const CSV_HEADER_KEYS = [
  'title',
  'content',
  'type',
  'category',
  'priority',
  'status',
  'createdAt',
] as const;

const PAGE_SIZE = 20;
const PRIORITY_ORDER: Record<'critical' | 'high' | 'medium' | 'low', number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

type TypeValue = (typeof TYPE_FILTER_VALUES)[number];
type PriorityValue = (typeof PRIORITY_FILTER_VALUES)[number];
type StatusValue = (typeof STATUS_FILTER_VALUES)[number];
type SortValue = (typeof SORT_BY_VALUES)[number];
type SortOrderValue = (typeof SORT_ORDER_VALUES)[number];

interface DateRange {
  start: string;
  end: string;
}

const CSV_FILENAME_PREFIX = 'notifications';

function normalizeStartDate(value: string) {
  return new Date(`${value}T00:00:00.000`);
}

function normalizeEndDate(value: string) {
  return new Date(`${value}T23:59:59.999`);
}

function isKnownDateGroup(
  label: string
): label is (typeof DATE_GROUP_KEYS)[number] {
  return (DATE_GROUP_KEYS as readonly string[]).includes(label);
}

export default function NotificationsPage() {
  const router = useRouter();
  const { isExpanded } = useSidebarStore();

  const notifications = useNotificationStore(state => state.notifications);
  const fetchNotifications = useNotificationStore(
    state => state.fetchNotifications
  );
  const markAsRead = useNotificationStore(state => state.markAsRead);
  const hasMore = useNotificationStore(state => state.hasMore);
  const isLoading = useNotificationStore(state => state.isLoading);

  const t = useTranslations('pages.notifications');
  const tList = useTranslations('components.notificationList');
  const tDateGroup = useTranslations('components.notificationList.dateGroup');
  const tPriority = useTranslations('components.notificationItem.priority');

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeValue>('all');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priorityFilter, setPriorityFilter] = useState<PriorityValue>('all');
  const [statusFilter, setStatusFilter] = useState<StatusValue>('all');
  const [sortKey, setSortKey] = useState<SortValue>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrderValue>('desc');
  const [dateRange, setDateRange] = useState<DateRange>({ start: '', end: '' });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());

  const observerTarget = useRef<HTMLDivElement>(null);

  const typeOptions = useMemo(
    () =>
      TYPE_FILTER_VALUES.map(value => ({
        value,
        label: t(`typeOptions.${value}`),
      })),
    [t]
  );

  const typeLabelMap = useMemo(
    () => new Map(typeOptions.map(option => [option.value, option.label])),
    [typeOptions]
  );

  const priorityOptions = useMemo(
    () =>
      PRIORITY_FILTER_VALUES.map(value => ({
        value,
        label:
          value === 'all'
            ? t('priorityOptions.all')
            : tPriority(value as Exclude<PriorityValue, 'all'>),
      })),
    [t, tPriority]
  );

  const priorityLabelMap = useMemo(
    () => new Map(priorityOptions.map(option => [option.value, option.label])),
    [priorityOptions]
  );

  const statusOptions = useMemo(
    () =>
      STATUS_FILTER_VALUES.map(value => ({
        value,
        label: t(`statusOptions.${value}`),
      })),
    [t]
  );

  const statusLabelMap = useMemo(
    () => new Map(statusOptions.map(option => [option.value, option.label])),
    [statusOptions]
  );

  const sortOptions = useMemo(
    () =>
      SORT_BY_VALUES.map(value => ({
        value,
        label: t(`sort.options.${value}`),
      })),
    [t]
  );

  const sortOrderOptions = useMemo(
    () =>
      SORT_ORDER_VALUES.map(value => ({
        value,
        label: t(`sort.order.${value}`),
      })),
    [t]
  );

  const categoryOptions = useMemo(
    () =>
      CATEGORY_DEFINITIONS.map(definition => ({
        value: definition.value,
        type: definition.type,
        label: t(`categories.${definition.value}`),
      })),
    [t]
  );

  const categoryLabelMap = useMemo(
    () => new Map(categoryOptions.map(option => [option.value, option.label])),
    [categoryOptions]
  );

  const sidebarPaddingClass = isExpanded
    ? 'md:pl-64 xl:pl-72'
    : 'md:pl-16 lg:pl-20';

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

  const typeLabelForCsv = useMemo(() => {
    return new Map(
      typeOptions
        .filter(option => option.value !== 'all')
        .map(option => [option.value, option.label])
    );
  }, [typeOptions]);

  const handleExportCsv = useCallback(() => {
    if (filteredNotifications.length === 0) return;

    const headerRow = CSV_HEADER_KEYS.map(headerKey =>
      t(`csv.headers.${headerKey}`)
    ).join(',');

    const rows = filteredNotifications.map(notification => {
      const values = [
        notification.title,
        notification.content.replace(/\s+/g, ' ').trim(),
        typeLabelForCsv.get(notification.type) ?? '',
        notification.category
          ? (categoryLabelMap.get(notification.category) ?? '')
          : '',
        priorityLabelMap.get(notification.priority) ?? '',
        notification.is_read
          ? t('statusOptions.read')
          : t('statusOptions.unread'),
        notification.created_at,
      ];

      return values.map(value => `"${value.replace(/"/g, '""')}"`).join(',');
    });

    const csvContent = [headerRow, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${CSV_FILENAME_PREFIX}-${Date.now()}.csv`);
    link.click();

    URL.revokeObjectURL(url);
  }, [
    filteredNotifications,
    categoryLabelMap,
    priorityLabelMap,
    t,
    typeLabelForCsv,
  ]);

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
  const selectionSummary = t('bulkActions.selectionSummary', {
    selected: selectedCount,
    total: totalVisible,
  });

  return (
    <div
      className={cn(
        'min-h-screen bg-stone-100/60 pt-20 pb-12 transition-[padding] duration-200 dark:bg-stone-900/40',
        'px-4 sm:px-6 lg:px-8',
        sidebarPaddingClass
      )}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex flex-col gap-4 border-b pb-4">
          <div>
            <h1 className="text-3xl font-semibold">{t('title')}</h1>
            <p className="text-muted-foreground mt-2 text-sm">
              {t('description')}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Input
              value={searchTerm}
              onChange={event => setSearchTerm(event.target.value)}
              placeholder={t('searchPlaceholder')}
              className="sm:max-w-md"
            />
            <div className="flex items-center gap-3">
              <Select
                value={sortKey}
                onValueChange={value => setSortKey(value as SortValue)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder={t('sort.label')} />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={sortOrder}
                onValueChange={value => setSortOrder(value as SortOrderValue)}
              >
                <SelectTrigger className="w-28">
                  <SelectValue placeholder={t('sort.order.label')} />
                </SelectTrigger>
                <SelectContent>
                  {sortOrderOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="space-y-6 rounded-xl border bg-white/70 p-4 shadow-sm dark:bg-stone-900/60">
            <div className="space-y-2">
              <h2 className="font-medium">{t('filters.type')}</h2>
              <Select
                value={typeFilter}
                onValueChange={value => setTypeFilter(value as TypeValue)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('filters.typePlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {typeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <h2 className="font-medium">{t('filters.categories')}</h2>
              <div className="flex flex-col gap-2 text-sm">
                {categoryOptions.map(option => {
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
              <h2 className="font-medium">{t('filters.priority')}</h2>
              <Select
                value={priorityFilter}
                onValueChange={value =>
                  setPriorityFilter(value as PriorityValue)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('filters.priorityPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <h2 className="font-medium">{t('filters.status')}</h2>
              <Select
                value={statusFilter}
                onValueChange={value => setStatusFilter(value as StatusValue)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('filters.statusPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <h2 className="font-medium">{t('filters.dateRange')}</h2>
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
              {t('filters.reset')}
            </Button>
          </aside>

          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-white/70 p-4 shadow-sm dark:bg-stone-900/60">
              <div className="text-sm">{selectionSummary}</div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleSelectAll}
                  disabled={totalVisible === 0}
                >
                  {selectedCount === totalVisible && totalVisible > 0
                    ? t('bulkActions.deselectAll')
                    : t('bulkActions.selectAll')}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearSelection}
                  disabled={selectedCount === 0}
                >
                  {t('bulkActions.clear')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkSelectedAsRead}
                  disabled={selectedCount === 0}
                >
                  {t('bulkActions.markRead')}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleExportCsv}
                  disabled={totalVisible === 0}
                >
                  <Download className="h-4 w-4" />
                  {t('bulkActions.export')}
                </Button>
              </div>
            </div>

            {filtersChanged && (
              <div className="text-muted-foreground text-xs">
                {t('filters.appliedHint')}
              </div>
            )}

            <div className="space-y-8">
              {groupedNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-white/70 p-12 text-center dark:bg-stone-900/40">
                  <h3 className="text-lg font-medium">{t('empty.title')}</h3>
                  <p className="text-muted-foreground mt-2 text-sm">
                    {t('empty.description')}
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="mt-4"
                    onClick={handleResetFilters}
                  >
                    {t('empty.reset')}
                  </Button>
                </div>
              ) : (
                groupedNotifications.map(group => (
                  <section key={group.label} className="space-y-4">
                    <div className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                      {isKnownDateGroup(group.label)
                        ? tDateGroup(group.label)
                        : group.label}
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
                  {tList('loadMore')}
                </Button>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
