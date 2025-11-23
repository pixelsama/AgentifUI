'use client';

import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select';
import { Switch } from '@components/ui/switch';
import { Textarea } from '@components/ui/textarea';
import type {
  Notification,
  NotificationPriority,
  NotificationType,
} from '@lib/types/notification-center';

import { useEffect, useState } from 'react';

interface NotificationFormProps {
  mode: 'create' | 'edit';
  id?: string;
}

const PRIORITIES: NotificationPriority[] = [
  'low',
  'medium',
  'high',
  'critical',
];

const TYPES: NotificationType[] = ['changelog', 'message'];

export function NotificationForm({ mode, id }: NotificationFormProps) {
  const [form, setForm] = useState({
    type: 'message' as NotificationType,
    category: '',
    title: '',
    content: '',
    priority: 'medium' as NotificationPriority,
    published: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (mode === 'edit' && id) {
      const fetchDetail = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const res = await fetch(`/api/notifications/${id}`);
          if (!res.ok) throw new Error('Failed to load notification');
          const data: Notification = await res.json();
          setForm({
            type: data.type,
            category: data.category || '',
            title: data.title,
            content: data.content,
            priority: data.priority,
            published: data.published,
          });
        } catch (e) {
          setError(e instanceof Error ? e.message : 'Unknown error');
        } finally {
          setIsLoading(false);
        }
      };
      void fetchDetail();
    }
  }, [mode, id]);

  const handleChange = (
    key: keyof typeof form,
    value: string | boolean | NotificationType | NotificationPriority
  ) => {
    setForm(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (mode === 'create') {
        const res = await fetch('/api/admin/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || 'Failed to create notification');
        }
        setSuccess('Created successfully');
        setForm({
          type: 'message',
          category: '',
          title: '',
          content: '',
          priority: 'medium',
          published: false,
        });
      } else if (mode === 'edit' && id) {
        const res = await fetch(`/api/notifications/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || 'Failed to update notification');
        }
        setSuccess('Updated successfully');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-4 rounded-lg border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-700 dark:bg-stone-800">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">
            {mode === 'create' ? 'New Notification' : 'Edit Notification'}
          </h1>
          <p className="text-sm text-stone-500">
            {mode === 'create'
              ? 'Create and publish a notification to users.'
              : 'Update notification content, priority, or publish status.'}
          </p>
        </div>
      </div>

      {error && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {success}
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Type</label>
            <Select
              value={form.type}
              onValueChange={value =>
                handleChange('type', value as NotificationType)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                {TYPES.map(t => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <Input
              placeholder="e.g. feature, admin_announcement"
              value={form.category}
              onChange={e => handleChange('category', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Priority</label>
            <Select
              value={form.priority}
              onValueChange={value =>
                handleChange('priority', value as NotificationPriority)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                {PRIORITIES.map(p => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Published</label>
            <div className="flex h-10 items-center gap-2 rounded-md border border-stone-200 px-3 dark:border-stone-700">
              <Switch
                checked={form.published}
                onCheckedChange={checked => handleChange('published', checked)}
              />
              <span className="text-sm text-stone-600 dark:text-stone-300">
                {form.published ? 'Published' : 'Draft'}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Title</label>
          <Input
            placeholder="Title"
            value={form.title}
            onChange={e => handleChange('title', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Content</label>
          <Textarea
            placeholder="Content"
            value={form.content}
            onChange={e => handleChange('content', e.target.value)}
            required
            className="min-h-[160px]"
          />
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => history.back()}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {mode === 'create' ? 'Create' : 'Save changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}
