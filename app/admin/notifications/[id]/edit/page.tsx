'use client';

import { Button } from '@components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { Input } from '@components/ui/input';
import { Textarea } from '@components/ui/textarea';
import type { NotificationCategory } from '@lib/types/notification-center';
import { cn } from '@lib/utils';
import { ArrowLeft, Eye, Save, Send, Trash } from 'lucide-react';

import { useEffect, useRef, useState } from 'react';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

interface NotificationForm {
  id: string;
  type: 'changelog' | 'message';
  category: NotificationCategory;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  target_roles: string[];
  target_users: string[];
  scheduled_time?: string;
  published: boolean;
  published_at: string | null;
}

const CATEGORY_OPTIONS: Record<
  NotificationCategory,
  { label: string; description: string }
> = {
  admin_announcement: {
    label: '管理员公告',
    description: '管理员发布的重要公告',
  },
  agent_result: { label: 'Agent结果', description: 'AI Agent执行结果通知' },
  token_usage: { label: 'Token使用', description: 'Token消耗和额度提醒' },
  system_maintenance: { label: '系统维护', description: '系统维护和停机通知' },
  security_alert: { label: '安全警告', description: '安全相关的重要警告' },
  feature_tip: { label: '功能提示', description: '新功能使用提示' },
  feature: { label: '新功能', description: '新功能发布公告' },
  improvement: { label: '改进', description: '功能改进和优化' },
  bugfix: { label: '修复', description: 'Bug修复公告' },
  security: { label: '安全更新', description: '安全相关更新' },
  api_change: { label: 'API变更', description: 'API接口变更通知' },
};

const PRIORITY_OPTIONS = {
  low: { label: '低', description: '一般信息，用户主动查看' },
  medium: { label: '中', description: '重要信息，显示通知徽章' },
  high: { label: '高', description: '紧急信息，显示即时通知' },
  critical: {
    label: '紧急',
    description: '严重问题，强制显示并自动打开通知中心',
  },
};

const ROLE_OPTIONS = [
  { value: 'user', label: '普通用户' },
  { value: 'admin', label: '管理员' },
  { value: 'developer', label: '开发者' },
  { value: 'tester', label: '测试人员' },
];

export default function EditNotificationPage() {
  const params = useParams();
  const router = useRouter();
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const [form, setForm] = useState<NotificationForm | null>(null);
  const [originalForm, setOriginalForm] = useState<NotificationForm | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load notification data
  useEffect(() => {
    const loadNotification = async () => {
      try {
        const response = await fetch(`/api/admin/notifications/${params.id}`);

        if (!response.ok) {
          throw new Error('Failed to fetch notification');
        }

        const notification = await response.json();

        const formData: NotificationForm = {
          id: notification.id,
          type: notification.type,
          category: notification.category,
          title: notification.title,
          content: notification.content,
          priority: notification.priority,
          target_roles: notification.target_roles || [],
          target_users: notification.target_users || [],
          scheduled_time: '', // Scheduled time is not currently supported
          published: notification.published,
          published_at: notification.published_at,
        };

        setForm(formData);
        setOriginalForm(formData);
      } catch (error) {
        console.error('Failed to load notification:', error);
        router.push('/admin/notifications');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      loadNotification();
    }
  }, [params.id, router]);

  const handleFieldChange = (
    field: keyof NotificationForm,
    value: string | string[] | boolean
  ) => {
    if (!form) return;
    setForm(prev => (prev ? { ...prev, [field]: value } : null));
  };

  const handleRoleToggle = (role: string) => {
    if (!form) return;
    setForm(prev =>
      prev
        ? {
            ...prev,
            target_roles: prev.target_roles.includes(role)
              ? prev.target_roles.filter(r => r !== role)
              : [...prev.target_roles, role],
          }
        : null
    );
  };

  const insertVariable = (variable: string) => {
    if (!form || !contentRef.current) return;

    const start = contentRef.current.selectionStart;
    const end = contentRef.current.selectionEnd;
    const newContent =
      form.content.substring(0, start) +
      `{${variable}}` +
      form.content.substring(end);

    setForm(prev => (prev ? { ...prev, content: newContent } : null));

    // Restore cursor position
    setTimeout(() => {
      if (contentRef.current) {
        const newPosition = start + variable.length + 2;
        contentRef.current.setSelectionRange(newPosition, newPosition);
        contentRef.current.focus();
      }
    }, 0);
  };

  const handleSave = async (publish?: boolean) => {
    if (!form || !isFormValid) return;

    setSaving(true);
    try {
      const updateData = {
        type: form.type,
        category: form.category,
        title: form.title,
        content: form.content,
        priority: form.priority,
        target_roles: form.target_roles,
        target_users: form.target_users,
        published: publish !== undefined ? publish : form.published,
      };

      const response = await fetch(`/api/admin/notifications/${form.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save notification');
      }

      const updatedNotification = await response.json();

      // Update form state with server response
      const updatedForm: NotificationForm = {
        ...form,
        ...updatedNotification,
      };

      setOriginalForm(updatedForm);
      setForm(updatedForm);

      // Redirect back to notifications list
      router.push('/admin/notifications');
    } catch (error) {
      console.error('Failed to save notification:', error);
      alert(
        '保存失败：' + (error instanceof Error ? error.message : '未知错误')
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!form) return;

    if (window.confirm('确定要删除这条通知吗？此操作无法撤销。')) {
      try {
        const response = await fetch(`/api/admin/notifications/${form.id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to delete notification');
        }

        router.push('/admin/notifications');
      } catch (error) {
        console.error('Failed to delete notification:', error);
        alert(
          '删除失败：' + (error instanceof Error ? error.message : '未知错误')
        );
      }
    }
  };

  const hasChanges =
    form &&
    originalForm &&
    JSON.stringify(form) !== JSON.stringify(originalForm);
  const isFormValid =
    form &&
    form.title.trim() &&
    form.content.trim() &&
    form.target_roles.length > 0;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-stone-600"></div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="mb-2 text-xl font-semibold text-stone-900 dark:text-gray-100">
            通知未找到
          </h2>
          <p className="mb-4 text-stone-600 dark:text-stone-400">
            请求的通知不存在或已被删除。
          </p>
          <Link href="/admin/notifications">
            <Button>返回通知列表</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/notifications">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-stone-900 dark:text-gray-100">
              编辑通知
            </h1>
            <p className="text-sm text-stone-600 dark:text-stone-400">
              编辑现有通知内容和设置
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setPreview(!preview)}>
            <Eye className="mr-2 h-4 w-4" />
            {preview ? '编辑' : '预览'}
          </Button>

          {form.published ? (
            <Button
              variant="outline"
              onClick={() => handleSave(false)}
              disabled={saving}
            >
              取消发布
            </Button>
          ) : (
            <Button
              onClick={() => handleSave(true)}
              disabled={!isFormValid || saving}
            >
              <Send className="mr-2 h-4 w-4" />
              发布
            </Button>
          )}

          <Button
            variant="outline"
            onClick={() => handleSave()}
            disabled={!hasChanges || !isFormValid || saving}
          >
            <Save className="mr-2 h-4 w-4" />
            保存
          </Button>

          <Button
            variant="outline"
            onClick={handleDelete}
            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          >
            <Trash className="mr-2 h-4 w-4" />
            删除
          </Button>
        </div>
      </div>

      {/* Status Banner */}
      {form.published && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                通知已发布
              </h3>
              <p className="text-sm text-green-600 dark:text-green-400">
                这条通知已于 {new Date(form.published_at!).toLocaleString()}{' '}
                发布给目标用户
              </p>
            </div>
          </div>
        </div>
      )}

      {hasChanges && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                未保存的更改
              </h3>
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                您有未保存的更改，请记得保存或发布更新
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="space-y-6 lg:col-span-2">
          {!preview ? (
            <>
              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle>基本信息</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-stone-700 dark:text-stone-300">
                        类型 *
                      </label>
                      <select
                        value={form.type}
                        onChange={e =>
                          handleFieldChange('type', e.target.value)
                        }
                        className="mt-1 block w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-800"
                      >
                        <option value="message">消息</option>
                        <option value="changelog">更新日志</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-stone-700 dark:text-stone-300">
                        分类 *
                      </label>
                      <select
                        value={form.category}
                        onChange={e =>
                          handleFieldChange('category', e.target.value)
                        }
                        className="mt-1 block w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-800"
                      >
                        {Object.entries(CATEGORY_OPTIONS).map(
                          ([value, { label }]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          )
                        )}
                      </select>
                      <p className="mt-1 text-xs text-stone-500">
                        {CATEGORY_OPTIONS[form.category].description}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-stone-700 dark:text-stone-300">
                      标题 *
                    </label>
                    <Input
                      value={form.title}
                      onChange={e => handleFieldChange('title', e.target.value)}
                      placeholder="输入通知标题..."
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-stone-700 dark:text-stone-300">
                      优先级 *
                    </label>
                    <select
                      value={form.priority}
                      onChange={e =>
                        handleFieldChange('priority', e.target.value)
                      }
                      className="mt-1 block w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-800"
                    >
                      {Object.entries(PRIORITY_OPTIONS).map(
                        ([value, { label }]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        )
                      )}
                    </select>
                    <p className="mt-1 text-xs text-stone-500">
                      {PRIORITY_OPTIONS[form.priority].description}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Content */}
              <Card>
                <CardHeader>
                  <CardTitle>通知内容</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-stone-700 dark:text-stone-300">
                      内容 *
                    </label>
                    <Textarea
                      ref={contentRef}
                      value={form.content}
                      onChange={e =>
                        handleFieldChange('content', e.target.value)
                      }
                      placeholder="输入通知内容..."
                      rows={8}
                      className="mt-1"
                    />
                    <p className="mt-1 text-xs text-stone-500">
                      支持变量替换，如 {'{username}'}, {'{time}'} 等
                    </p>
                  </div>

                  {/* Variable Insertion */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-300">
                      快速插入变量
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        'username',
                        'time',
                        'date',
                        'location',
                        'device',
                        'ip',
                        'agentName',
                        'duration',
                        'result',
                        'percentage',
                        'currentUsage',
                        'limit',
                      ].map(variable => (
                        <Button
                          key={variable}
                          variant="outline"
                          size="sm"
                          onClick={() => insertVariable(variable)}
                          type="button"
                        >
                          {'{' + variable + '}'}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Target Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>发送目标</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-stone-700 dark:text-stone-300">
                      目标角色 *
                    </label>
                    <div className="mt-2 space-y-2">
                      {ROLE_OPTIONS.map(role => (
                        <label key={role.value} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={form.target_roles.includes(role.value)}
                            onChange={() => handleRoleToggle(role.value)}
                            className="mr-2 rounded"
                          />
                          <span className="text-sm">{role.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-stone-700 dark:text-stone-300">
                      定时发布
                    </label>
                    <Input
                      type="datetime-local"
                      value={form.scheduled_time}
                      onChange={e =>
                        handleFieldChange('scheduled_time', e.target.value)
                      }
                      className="mt-1"
                    />
                    <p className="mt-1 text-xs text-stone-500">
                      留空表示立即发布
                    </p>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            /* Preview */
            <Card>
              <CardHeader>
                <CardTitle>通知预览</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border bg-gray-50 p-4 dark:bg-gray-900">
                  <div className="mb-3 flex items-center gap-2">
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                        'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                      )}
                    >
                      {CATEGORY_OPTIONS[form.category].label}
                    </span>
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                        form.priority === 'critical'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                          : form.priority === 'high'
                            ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
                            : form.priority === 'medium'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                      )}
                    >
                      {PRIORITY_OPTIONS[form.priority].label}
                    </span>
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                        form.type === 'changelog'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                          : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                      )}
                    >
                      {form.type === 'changelog' ? '更新日志' : '消息'}
                    </span>
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                        form.published
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                      )}
                    >
                      {form.published ? '已发布' : '草稿'}
                    </span>
                  </div>

                  <h3 className="mb-2 text-lg font-medium text-stone-900 dark:text-gray-100">
                    {form.title}
                  </h3>

                  <div className="text-sm whitespace-pre-wrap text-stone-600 dark:text-stone-400">
                    {form.content}
                  </div>

                  <div className="mt-4 border-t border-gray-200 pt-3 dark:border-gray-700">
                    <div className="text-xs text-stone-500">
                      目标角色: {form.target_roles.join(', ')}
                    </div>
                    {form.scheduled_time && (
                      <div className="mt-1 text-xs text-stone-500">
                        定时发布:{' '}
                        {new Date(form.scheduled_time).toLocaleString()}
                      </div>
                    )}
                    {form.published_at && (
                      <div className="mt-1 text-xs text-stone-500">
                        发布时间: {new Date(form.published_at).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>通知统计</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-stone-600 dark:text-stone-400">
                  状态:
                </span>
                <span
                  className={cn(
                    'font-medium',
                    form.published
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-yellow-600 dark:text-yellow-400'
                  )}
                >
                  {form.published ? '已发布' : '草稿'}
                </span>
              </div>
              {form.published_at && (
                <div className="flex justify-between">
                  <span className="text-stone-600 dark:text-stone-400">
                    发布时间:
                  </span>
                  <span>
                    {new Date(form.published_at).toLocaleDateString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-stone-600 dark:text-stone-400">
                  目标用户:
                </span>
                <span>{form.target_roles.join(', ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-600 dark:text-stone-400">
                  优先级:
                </span>
                <span>{PRIORITY_OPTIONS[form.priority].label}</span>
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle>编辑提示</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-stone-600 dark:text-stone-400">
              <div>
                <strong>注意事项：</strong>
                <ul className="mt-1 list-inside list-disc space-y-1">
                  <li>已发布的通知修改后需要重新发布</li>
                  <li>修改优先级可能影响推送策略</li>
                  <li>变量在发送时会被实际值替换</li>
                  <li>删除操作无法撤销，请谨慎操作</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
