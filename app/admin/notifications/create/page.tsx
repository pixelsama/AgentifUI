'use client';

import { Button } from '@components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { Input } from '@components/ui/input';
import { Textarea } from '@components/ui/textarea';
import type { NotificationCategory } from '@lib/types/notification-center';
import { cn } from '@lib/utils';
import { ArrowLeft, Eye, Save, Send } from 'lucide-react';

import { useRef, useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface NotificationForm {
  type: 'changelog' | 'message';
  category: NotificationCategory;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  target_roles: string[];
  target_users: string[];
  scheduled_time?: string;
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

const NOTIFICATION_TEMPLATES = {
  token_warning: {
    title: 'Token使用量警告',
    content:
      '您的Token使用量已达到{percentage}%，请注意控制使用量以避免服务中断。\n\n当前使用量：{currentUsage}\n总额度：{limit}\n\n请合理安排使用计划。',
    category: 'token_usage' as NotificationCategory,
    priority: 'medium' as const,
  },
  agent_completed: {
    title: 'Agent执行完成',
    content:
      'Agent "{agentName}" 已成功执行完成。\n\n执行结果：{result}\n耗时：{duration}\n\n详细结果请查看执行日志。',
    category: 'agent_result' as NotificationCategory,
    priority: 'low' as const,
  },
  maintenance_notice: {
    title: '系统维护通知',
    content:
      '系统将于{time}进行例行维护，预计持续{duration}。\n\n维护期间可能出现的影响：\n- 服务暂时中断\n- 数据同步延迟\n\n请提前保存您的工作，感谢您的理解。',
    category: 'system_maintenance' as NotificationCategory,
    priority: 'high' as const,
  },
  security_alert: {
    title: '安全警告',
    content:
      '检测到您的账户存在异常活动。\n\n异常详情：{details}\n检测时间：{time}\n来源IP：{ip}\n\n如非本人操作，请立即修改密码并联系管理员。',
    category: 'security_alert' as NotificationCategory,
    priority: 'critical' as const,
  },
  feature_announcement: {
    title: '新功能发布',
    content:
      '我们很高兴地宣布推出新功能：{featureName}\n\n主要特性：\n{features}\n\n立即体验这些强大的新功能！',
    category: 'feature' as NotificationCategory,
    priority: 'medium' as const,
  },
};

export default function CreateNotificationPage() {
  const router = useRouter();
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const [form, setForm] = useState<NotificationForm>({
    type: 'message',
    category: 'admin_announcement',
    title: '',
    content: '',
    priority: 'medium',
    target_roles: ['user'],
    target_users: [],
    scheduled_time: '',
  });

  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleFieldChange = (
    field: keyof NotificationForm,
    value: string | string[]
  ) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleTemplateSelect = (
    templateKey: keyof typeof NOTIFICATION_TEMPLATES
  ) => {
    const template = NOTIFICATION_TEMPLATES[templateKey];
    setForm(prev => ({
      ...prev,
      title: template.title,
      content: template.content,
      category: template.category,
      priority: template.priority,
    }));
  };

  const handleRoleToggle = (role: string) => {
    setForm(prev => ({
      ...prev,
      target_roles: prev.target_roles.includes(role)
        ? prev.target_roles.filter(r => r !== role)
        : [...prev.target_roles, role],
    }));
  };

  const insertVariable = (variable: string) => {
    if (contentRef.current) {
      const start = contentRef.current.selectionStart;
      const end = contentRef.current.selectionEnd;
      const newContent =
        form.content.substring(0, start) +
        `{${variable}}` +
        form.content.substring(end);

      setForm(prev => ({ ...prev, content: newContent }));

      // Restore cursor position
      setTimeout(() => {
        if (contentRef.current) {
          const newPosition = start + variable.length + 2;
          contentRef.current.setSelectionRange(newPosition, newPosition);
          contentRef.current.focus();
        }
      }, 0);
    }
  };

  const handleSave = async (publish: boolean = false) => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log('Saving notification:', { ...form, published: publish });

      // Redirect back to notifications list
      router.push('/admin/notifications');
    } catch (error) {
      console.error('Failed to save notification:', error);
    } finally {
      setSaving(false);
    }
  };

  const isFormValid =
    form.title.trim() && form.content.trim() && form.target_roles.length > 0;

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
              创建通知
            </h1>
            <p className="text-sm text-stone-600 dark:text-stone-400">
              创建新的系统通知或更新日志
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setPreview(!preview)}>
            <Eye className="mr-2 h-4 w-4" />
            {preview ? '编辑' : '预览'}
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSave(false)}
            disabled={!isFormValid || saving}
          >
            <Save className="mr-2 h-4 w-4" />
            保存草稿
          </Button>
          <Button
            onClick={() => handleSave(true)}
            disabled={!isFormValid || saving}
          >
            <Send className="mr-2 h-4 w-4" />
            发布
          </Button>
        </div>
      </div>

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
                        'agentName',
                        'duration',
                        'result',
                        'percentage',
                        'currentUsage',
                        'limit',
                        'details',
                        'ip',
                        'featureName',
                        'features',
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
                  </div>

                  <h3 className="mb-2 text-lg font-medium text-stone-900 dark:text-gray-100">
                    {form.title || '通知标题'}
                  </h3>

                  <div className="text-sm whitespace-pre-wrap text-stone-600 dark:text-stone-400">
                    {form.content || '通知内容'}
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
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Templates */}
          <Card>
            <CardHeader>
              <CardTitle>通知模板</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {Object.entries(NOTIFICATION_TEMPLATES).map(([key, template]) => (
                <Button
                  key={key}
                  variant="outline"
                  className="h-auto w-full justify-start p-3"
                  onClick={() =>
                    handleTemplateSelect(
                      key as keyof typeof NOTIFICATION_TEMPLATES
                    )
                  }
                >
                  <div className="text-left">
                    <div className="font-medium">{template.title}</div>
                    <div className="mt-1 text-xs text-stone-500">
                      {CATEGORY_OPTIONS[template.category].label} ·{' '}
                      {PRIORITY_OPTIONS[template.priority].label}
                    </div>
                  </div>
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle>编写提示</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-stone-600 dark:text-stone-400">
              <div>
                <strong>优先级建议：</strong>
                <ul className="mt-1 list-inside list-disc space-y-1">
                  <li>紧急：安全问题、系统故障</li>
                  <li>高：维护通知、重要更新</li>
                  <li>中：功能发布、一般公告</li>
                  <li>低：提示信息、使用技巧</li>
                </ul>
              </div>

              <div>
                <strong>内容建议：</strong>
                <ul className="mt-1 list-inside list-disc space-y-1">
                  <li>标题简洁明了</li>
                  <li>内容结构清晰</li>
                  <li>使用变量提高复用性</li>
                  <li>包含必要的行动指导</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
