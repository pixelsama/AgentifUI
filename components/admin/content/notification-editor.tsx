'use client';

import { CustomSelect } from '@components/ui/custom-select';
import { useTheme } from '@lib/hooks/use-theme';
import { cn } from '@lib/utils';
import { Plus, Trash2 } from 'lucide-react';

import React from 'react';

// --- BEGIN COMMENT ---
// 通知配置类型定义 - 简化版本
// --- END COMMENT ---
export interface NotificationConfig {
  id: string;
  title: string;
  content: string;
  type: 'update' | 'feature' | 'announcement' | 'maintenance';
  position: 'center' | 'bottom-right' | 'top-center';
  isActive: boolean;
  startDate: string;
  endDate: string | null;
}

interface NotificationEditorProps {
  notifications: NotificationConfig[];
  selectedNotification: NotificationConfig | null;
  onNotificationsChange: (notifications: NotificationConfig[]) => void;
  onSelectedChange: (notification: NotificationConfig | null) => void;
}

export function NotificationEditor({
  notifications,
  selectedNotification,
  onNotificationsChange,
  onSelectedChange,
}: NotificationEditorProps) {
  const { isDark } = useTheme();

  // --- BEGIN COMMENT ---
  // 添加新通知
  // --- END COMMENT ---
  const addNotification = () => {
    const newNotification: NotificationConfig = {
      id: Date.now().toString(),
      title: '新通知',
      content: '请输入通知内容...',
      type: 'announcement',
      position: 'center',
      isActive: false,
      startDate: new Date().toISOString().split('T')[0],
      endDate: null,
    };
    onNotificationsChange([...notifications, newNotification]);
    onSelectedChange(newNotification);
  };

  // --- BEGIN COMMENT ---
  // 更新通知
  // --- END COMMENT ---
  const updateNotification = (
    id: string,
    updates: Partial<NotificationConfig>
  ) => {
    const updatedNotifications = notifications.map(notif =>
      notif.id === id ? { ...notif, ...updates } : notif
    );
    onNotificationsChange(updatedNotifications);

    if (selectedNotification?.id === id) {
      onSelectedChange({ ...selectedNotification, ...updates });
    }
  };

  // --- BEGIN COMMENT ---
  // 删除通知
  // --- END COMMENT ---
  const deleteNotification = (id: string) => {
    onNotificationsChange(notifications.filter(notif => notif.id !== id));
    if (selectedNotification?.id === id) {
      onSelectedChange(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* --- BEGIN COMMENT ---
      通知列表头部
      --- END COMMENT --- */}
      <div className="flex items-center justify-between">
        <h3
          className={cn(
            'font-semibold',
            isDark ? 'text-stone-100' : 'text-stone-900'
          )}
        >
          通知列表
        </h3>
        <button
          onClick={addNotification}
          className={cn(
            'flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors',
            isDark
              ? 'bg-stone-700 text-stone-100 hover:bg-stone-600'
              : 'bg-stone-800 text-white hover:bg-stone-700'
          )}
        >
          <Plus className="h-4 w-4" />
          新建通知
        </button>
      </div>

      {/* --- BEGIN COMMENT ---
      通知列表
      --- END COMMENT --- */}
      <div className="space-y-2">
        {notifications.map(notification => (
          <div
            key={notification.id}
            onClick={() => onSelectedChange(notification)}
            className={cn(
              'cursor-pointer rounded-lg border p-3 transition-colors',
              selectedNotification?.id === notification.id
                ? isDark
                  ? 'border-stone-500 bg-stone-600'
                  : 'border-stone-300 bg-stone-100'
                : isDark
                  ? 'hover:bg-stone-650 border-stone-600 bg-stone-700'
                  : 'border-stone-200 bg-stone-50 hover:bg-stone-100'
            )}
          >
            <div className="mb-1 flex items-center justify-between">
              <span
                className={cn(
                  'text-sm font-medium',
                  isDark ? 'text-stone-100' : 'text-stone-900'
                )}
              >
                {notification.title}
              </span>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'rounded px-2 py-0.5 text-xs',
                    notification.isActive
                      ? 'bg-green-100 text-green-800'
                      : isDark
                        ? 'bg-stone-600 text-stone-300'
                        : 'bg-gray-100 text-gray-600'
                  )}
                >
                  {notification.isActive ? '已激活' : '未激活'}
                </span>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    deleteNotification(notification.id);
                  }}
                  className={cn(
                    'rounded p-1 transition-colors',
                    isDark
                      ? 'text-red-400 hover:bg-red-900/30'
                      : 'text-red-600 hover:bg-red-100'
                  )}
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
            <p
              className={cn(
                'truncate text-xs',
                isDark ? 'text-stone-400' : 'text-stone-600'
              )}
            >
              {notification.content}
            </p>
          </div>
        ))}
      </div>

      {/* --- BEGIN COMMENT ---
      通知详情编辑区域
      --- END COMMENT --- */}
      {selectedNotification && (
        <div
          className={cn(
            'mt-6 space-y-4 border-t pt-6',
            isDark ? 'border-stone-600' : 'border-stone-200'
          )}
        >
          <h4
            className={cn(
              'font-semibold',
              isDark ? 'text-stone-100' : 'text-stone-900'
            )}
          >
            编辑通知
          </h4>

          {/* --- BEGIN COMMENT ---
          通知标题
          --- END COMMENT --- */}
          <div>
            <label
              className={cn(
                'mb-2 block text-sm font-medium',
                isDark ? 'text-stone-300' : 'text-stone-700'
              )}
            >
              通知标题
            </label>
            <input
              type="text"
              value={selectedNotification.title}
              onChange={e =>
                updateNotification(selectedNotification.id, {
                  title: e.target.value,
                })
              }
              className={cn(
                'w-full rounded-lg border px-3 py-2 text-sm',
                isDark
                  ? 'border-stone-600 bg-stone-700 text-stone-100'
                  : 'border-stone-300 bg-white text-stone-900'
              )}
            />
          </div>

          {/* --- BEGIN COMMENT ---
          通知内容
          --- END COMMENT --- */}
          <div>
            <label
              className={cn(
                'mb-2 block text-sm font-medium',
                isDark ? 'text-stone-300' : 'text-stone-700'
              )}
            >
              通知内容
            </label>
            <textarea
              value={selectedNotification.content}
              onChange={e =>
                updateNotification(selectedNotification.id, {
                  content: e.target.value,
                })
              }
              rows={3}
              className={cn(
                'w-full resize-none rounded-lg border px-3 py-2 text-sm',
                isDark
                  ? 'border-stone-600 bg-stone-700 text-stone-100'
                  : 'border-stone-300 bg-white text-stone-900'
              )}
            />
          </div>

          {/* --- BEGIN COMMENT ---
          通知类型
          --- END COMMENT --- */}
          <div>
            <label
              className={cn(
                'mb-2 block text-sm font-medium',
                isDark ? 'text-stone-300' : 'text-stone-700'
              )}
            >
              通知类型
            </label>
            <CustomSelect
              value={selectedNotification.type}
              onChange={value =>
                updateNotification(selectedNotification.id, {
                  type: value as any,
                })
              }
              options={[
                { value: 'announcement', label: '公告' },
                { value: 'update', label: '更新' },
                { value: 'feature', label: '新功能' },
                { value: 'maintenance', label: '维护' },
              ]}
            />
          </div>

          {/* --- BEGIN COMMENT ---
          显示位置
          --- END COMMENT --- */}
          <div>
            <label
              className={cn(
                'mb-2 block text-sm font-medium',
                isDark ? 'text-stone-300' : 'text-stone-700'
              )}
            >
              显示位置
            </label>
            <CustomSelect
              value={selectedNotification.position}
              onChange={value =>
                updateNotification(selectedNotification.id, {
                  position: value as any,
                })
              }
              options={[
                { value: 'center', label: '中央模态框' },
                { value: 'top-center', label: '顶部横幅' },
                { value: 'bottom-right', label: '右下角提示' },
              ]}
            />
          </div>

          {/* --- BEGIN COMMENT ---
          时间设置
          --- END COMMENT --- */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                className={cn(
                  'mb-2 block text-sm font-medium',
                  isDark ? 'text-stone-300' : 'text-stone-700'
                )}
              >
                开始时间
              </label>
              <input
                type="date"
                value={selectedNotification.startDate}
                onChange={e =>
                  updateNotification(selectedNotification.id, {
                    startDate: e.target.value,
                  })
                }
                className={cn(
                  'w-full rounded-lg border px-3 py-2 text-sm',
                  isDark
                    ? 'border-stone-600 bg-stone-700 text-stone-100'
                    : 'border-stone-300 bg-white text-stone-900'
                )}
              />
            </div>

            <div>
              <label
                className={cn(
                  'mb-2 block text-sm font-medium',
                  isDark ? 'text-stone-300' : 'text-stone-700'
                )}
              >
                结束时间
              </label>
              <input
                type="date"
                value={selectedNotification.endDate || ''}
                onChange={e =>
                  updateNotification(selectedNotification.id, {
                    endDate: e.target.value || null,
                  })
                }
                className={cn(
                  'w-full rounded-lg border px-3 py-2 text-sm',
                  isDark
                    ? 'border-stone-600 bg-stone-700 text-stone-100'
                    : 'border-stone-300 bg-white text-stone-900'
                )}
              />
            </div>
          </div>

          {/* --- BEGIN COMMENT ---
          激活状态 - 优化显示，更明显
          --- END COMMENT --- */}
          <div
            className={cn(
              'rounded-lg border p-4',
              isDark
                ? 'border-stone-600 bg-stone-700'
                : 'border-stone-200 bg-stone-100'
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <label
                  className={cn(
                    'mb-1 block text-sm font-medium',
                    isDark ? 'text-stone-100' : 'text-stone-900'
                  )}
                >
                  通知状态
                </label>
                <p
                  className={cn(
                    'text-xs',
                    isDark ? 'text-stone-400' : 'text-stone-600'
                  )}
                >
                  只有激活的通知才会在预览中显示
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    'text-sm',
                    selectedNotification.isActive
                      ? isDark
                        ? 'text-green-400'
                        : 'text-green-600'
                      : isDark
                        ? 'text-stone-400'
                        : 'text-stone-500'
                  )}
                >
                  {selectedNotification.isActive ? '已激活' : '未激活'}
                </span>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={selectedNotification.isActive}
                    onChange={e =>
                      updateNotification(selectedNotification.id, {
                        isActive: e.target.checked,
                      })
                    }
                    className="peer sr-only"
                  />
                  <div
                    className={cn(
                      'peer relative h-6 w-11 rounded-full transition-colors duration-200',
                      'peer-focus:ring-2 peer-focus:ring-offset-2 peer-focus:outline-none',
                      selectedNotification.isActive
                        ? isDark
                          ? 'bg-stone-600 peer-focus:ring-stone-500'
                          : 'bg-stone-800 peer-focus:ring-stone-300'
                        : isDark
                          ? 'bg-stone-700 peer-focus:ring-stone-600'
                          : 'bg-stone-300 peer-focus:ring-stone-200'
                    )}
                  >
                    <div
                      className={cn(
                        'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform duration-200',
                        selectedNotification.isActive
                          ? 'translate-x-5'
                          : 'translate-x-0'
                      )}
                    />
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
