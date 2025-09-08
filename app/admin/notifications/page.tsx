'use client';

import { Button } from '@components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { Input } from '@components/ui/input';
import { useNotificationStore } from '@lib/stores/ui/notification-store';
import type { NotificationCategory } from '@lib/types/notification-center';
import { cn } from '@lib/utils';
import { formatDistanceToNow } from 'date-fns';
import {
  Bell,
  Calendar,
  ChevronDown,
  ChevronRight,
  Edit,
  Eye,
  Filter,
  Plus,
  Search,
  Trash,
  Users,
} from 'lucide-react';

import { useEffect, useState } from 'react';

import { useTranslations } from 'next-intl';
import Link from 'next/link';

interface Notification {
  id: string;
  type: 'changelog' | 'message';
  category: NotificationCategory;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  published: boolean;
  published_at: string | null;
  created_at: string;
  created_by: string;
  target_roles: string[];
  target_users: string[];
  metadata: Record<string, unknown>;
}

const getCategoryOptions = (
  t: (key: string) => string
): Record<NotificationCategory, { label: string; color: string }> => ({
  admin_announcement: {
    label: t('categories.admin_announcement.label'),
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  },
  agent_result: {
    label: t('categories.agent_result.label'),
    color:
      'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  },
  token_usage: {
    label: t('categories.token_usage.label'),
    color:
      'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  },
  system_maintenance: {
    label: t('categories.system_maintenance.label'),
    color:
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  },
  security_alert: {
    label: t('categories.security_alert.label'),
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  },
  feature_tip: {
    label: t('categories.feature_tip.label'),
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  },
  feature: {
    label: t('categories.feature.label'),
    color:
      'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
  },
  improvement: {
    label: t('categories.improvement.label'),
    color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
  },
  bugfix: {
    label: t('categories.bugfix.label'),
    color: 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300',
  },
  security: {
    label: t('categories.security.label'),
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  },
  api_change: {
    label: t('categories.api_change.label'),
    color:
      'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-300',
  },
});

const getPriorityOptions = (t: (key: string) => string) => ({
  low: {
    label: t('priorities.low'),
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  },
  medium: {
    label: t('priorities.medium'),
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  },
  high: {
    label: t('priorities.high'),
    color:
      'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  },
  critical: {
    label: t('priorities.critical'),
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  },
});

export default function NotificationsAdminPage() {
  const t = useTranslations('pages.admin.notifications');
  const categoryOptions = getCategoryOptions(t);
  const priorityOptions = getPriorityOptions(t);
  const { showNotification } = useNotificationStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<
    'all' | 'changelog' | 'message'
  >('all');
  const [selectedCategory, setSelectedCategory] = useState<
    NotificationCategory | 'all'
  >('all');
  const [selectedPriority, setSelectedPriority] = useState<
    'all' | 'low' | 'medium' | 'high' | 'critical'
  >('all');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch notifications from API
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);

        // Build query parameters
        const params = new URLSearchParams();
        if (selectedType !== 'all') {
          params.append('type', selectedType);
        }
        if (selectedCategory !== 'all') {
          params.append('category', selectedCategory);
        }
        if (selectedPriority !== 'all') {
          params.append('priority', selectedPriority);
        }
        params.append('limit', '100'); // Get more notifications for admin view

        const response = await fetch(`/api/admin/notifications?${params}`);
        if (!response.ok) {
          throw new Error('Failed to fetch notifications');
        }

        const data = await response.json();
        setNotifications(data.notifications || []);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [selectedType, selectedCategory, selectedPriority]);

  const filteredNotifications = notifications.filter(notification => {
    if (
      searchQuery &&
      !notification.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !notification.content.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    if (selectedType !== 'all' && notification.type !== selectedType) {
      return false;
    }
    if (
      selectedCategory !== 'all' &&
      notification.category !== selectedCategory
    ) {
      return false;
    }
    if (
      selectedPriority !== 'all' &&
      notification.priority !== selectedPriority
    ) {
      return false;
    }
    return true;
  });

  const handleDeleteNotification = async (id: string) => {
    if (window.confirm(t('actions.confirmDelete'))) {
      try {
        const response = await fetch(`/api/admin/notifications/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete notification');
        }

        // Remove from local state
        setNotifications(prev => prev.filter(n => n.id !== id));
      } catch (error) {
        console.error('Failed to delete notification:', error);
        showNotification(t('actions.deleteError'), 'error', 5000);
      }
    }
  };

  const handleTogglePublish = async (id: string) => {
    const notification = notifications.find(n => n.id === id);
    if (!notification) return;

    try {
      const response = await fetch(`/api/admin/notifications/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          published: !notification.published,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update notification');
      }

      const updatedNotification = await response.json();

      // Update local state
      setNotifications(prev =>
        prev.map(n => (n.id === id ? updatedNotification : n))
      );
    } catch (error) {
      console.error('Failed to toggle publish status:', error);
      showNotification(t('actions.updateError'), 'error', 5000);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-gray-100">
            {t('title')}
          </h1>
          <p className="text-sm text-stone-600 dark:text-stone-400">
            {t('subtitle')}
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/notifications/create">
            <Plus className="mr-2 h-4 w-4" />
            {t('createButton')}
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              {t('filtersAndSearch.title')}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="mr-2 h-4 w-4" />
              {t('filtersAndSearch.filtersButton')}
              {showFilters ? (
                <ChevronDown className="ml-2 h-4 w-4" />
              ) : (
                <ChevronRight className="ml-2 h-4 w-4" />
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <Input
              placeholder={t('filtersAndSearch.searchPlaceholder')}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="text-sm font-medium text-stone-700 dark:text-stone-300">
                  {t('filtersAndSearch.type.label')}
                </label>
                <select
                  value={selectedType}
                  onChange={e =>
                    setSelectedType(
                      e.target.value as 'all' | 'changelog' | 'message'
                    )
                  }
                  className="mt-1 block w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-800"
                >
                  <option value="all">{t('filtersAndSearch.type.all')}</option>
                  <option value="message">
                    {t('filtersAndSearch.type.message')}
                  </option>
                  <option value="changelog">
                    {t('filtersAndSearch.type.changelog')}
                  </option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-stone-700 dark:text-stone-300">
                  {t('filtersAndSearch.category.label')}
                </label>
                <select
                  value={selectedCategory}
                  onChange={e =>
                    setSelectedCategory(
                      e.target.value as NotificationCategory | 'all'
                    )
                  }
                  className="mt-1 block w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-800"
                >
                  <option value="all">
                    {t('filtersAndSearch.category.all')}
                  </option>
                  {Object.entries(categoryOptions).map(([value, { label }]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-stone-700 dark:text-stone-300">
                  {t('filtersAndSearch.priority.label')}
                </label>
                <select
                  value={selectedPriority}
                  onChange={e =>
                    setSelectedPriority(
                      e.target.value as
                        | 'all'
                        | 'low'
                        | 'medium'
                        | 'high'
                        | 'critical'
                    )
                  }
                  className="mt-1 block w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-800"
                >
                  <option value="all">
                    {t('filtersAndSearch.priority.all')}
                  </option>
                  {Object.entries(priorityOptions).map(([value, { label }]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="mr-2 h-5 w-5" />
            {t('list.title')} ({filteredNotifications.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-stone-600"></div>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="py-8 text-center text-stone-500">
              {searchQuery ||
              selectedType !== 'all' ||
              selectedCategory !== 'all' ||
              selectedPriority !== 'all'
                ? t('noMatchingData')
                : t('noData')}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNotifications.map(notification => (
                <div
                  key={notification.id}
                  className={cn(
                    'rounded-lg border p-4 transition-colors',
                    notification.published
                      ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                      : 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20'
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <span
                          className={cn(
                            'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                            categoryOptions[notification.category].color
                          )}
                        >
                          {categoryOptions[notification.category].label}
                        </span>
                        <span
                          className={cn(
                            'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                            priorityOptions[notification.priority].color
                          )}
                        >
                          {priorityOptions[notification.priority].label}
                        </span>
                        <span
                          className={cn(
                            'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                            notification.type === 'changelog'
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                          )}
                        >
                          {notification.type === 'changelog'
                            ? t('types.changelog')
                            : t('types.message')}
                        </span>
                        <span
                          className={cn(
                            'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                            notification.published
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                          )}
                        >
                          {notification.published
                            ? t('status.published')
                            : t('status.draft')}
                        </span>
                      </div>

                      <h3 className="mb-2 text-lg font-medium text-stone-900 dark:text-gray-100">
                        {notification.title}
                      </h3>

                      <p className="mb-3 line-clamp-2 text-sm text-stone-600 dark:text-stone-400">
                        {notification.content}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-stone-500 dark:text-stone-400">
                        <div className="flex items-center">
                          <Calendar className="mr-1 h-3 w-3" />
                          {t('list.created')}{' '}
                          {formatDistanceToNow(
                            new Date(notification.created_at),
                            { addSuffix: true }
                          )}
                        </div>
                        {notification.published_at && (
                          <div className="flex items-center">
                            <Eye className="mr-1 h-3 w-3" />
                            {t('list.published')}{' '}
                            {formatDistanceToNow(
                              new Date(notification.published_at),
                              { addSuffix: true }
                            )}
                          </div>
                        )}
                        <div className="flex items-center">
                          <Users className="mr-1 h-3 w-3" />
                          {t('list.target')}:{' '}
                          {notification.target_roles.length > 0
                            ? notification.target_roles.join(', ')
                            : t('list.none')}
                        </div>
                      </div>
                    </div>

                    <div className="ml-4 flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTogglePublish(notification.id)}
                      >
                        {notification.published
                          ? t('actions.unpublish')
                          : t('actions.publish')}
                      </Button>
                      <Link
                        href={`/admin/notifications/${notification.id}/edit`}
                      >
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleDeleteNotification(notification.id)
                        }
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
