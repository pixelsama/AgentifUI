'use client';

import { useTheme } from '@lib/hooks/use-theme';
import { cn } from '@lib/utils';
import { AlertTriangle, Bell, Info, Wrench, X } from 'lucide-react';

import React from 'react';

import { NotificationConfig } from './notification-editor';

interface NotificationPreviewProps {
  notification: NotificationConfig;
}

const NotificationPreview: React.FC<NotificationPreviewProps> = ({
  notification,
}) => {
  const { isDark } = useTheme();

  // --- BEGIN COMMENT ---
  // 获取通知类型图标和颜色 (统一stone配色)
  // --- END COMMENT ---
  const getTypeStyles = () => {
    switch (notification.type) {
      case 'update':
        return {
          icon: <Bell className="h-5 w-5" />,
          color: isDark ? 'text-stone-300' : 'text-stone-700',
          bg: isDark ? 'bg-stone-700/50' : 'bg-stone-200/50',
          border: isDark ? 'border-stone-600/50' : 'border-stone-300/50',
        };
      case 'feature':
        return {
          icon: <Info className="h-5 w-5" />,
          color: isDark ? 'text-stone-300' : 'text-stone-700',
          bg: isDark ? 'bg-stone-700/50' : 'bg-stone-200/50',
          border: isDark ? 'border-stone-600/50' : 'border-stone-300/50',
        };
      case 'maintenance':
        return {
          icon: <Wrench className="h-5 w-5" />,
          color: isDark ? 'text-stone-300' : 'text-stone-700',
          bg: isDark ? 'bg-stone-700/50' : 'bg-stone-200/50',
          border: isDark ? 'border-stone-600/50' : 'border-stone-300/50',
        };
      case 'announcement':
      default:
        return {
          icon: <AlertTriangle className="h-5 w-5" />,
          color: isDark ? 'text-stone-300' : 'text-stone-700',
          bg: isDark ? 'bg-stone-700/50' : 'bg-stone-200/50',
          border: isDark ? 'border-stone-600/50' : 'border-stone-300/50',
        };
    }
  };

  const typeStyles = getTypeStyles();

  // --- BEGIN COMMENT ---
  // 渲染对应位置的通知
  // --- END COMMENT ---
  const renderNotification = () => {
    if (!notification.isActive) return null;

    switch (notification.position) {
      case 'top-center':
        return renderTopNotification();
      case 'bottom-right':
        return renderBottomRightNotification();
      case 'center':
      default:
        return renderCenterNotification();
    }
  };

  // --- BEGIN COMMENT ---
  // 中央模态框通知 - 预览版本
  // --- END COMMENT ---
  const renderCenterNotification = () => (
    <div className="absolute inset-0 flex items-center justify-center">
      <div
        className={cn(
          'relative mx-4 w-full max-w-md rounded-lg border p-6 shadow-lg',
          isDark ? 'border-stone-600 bg-stone-800' : 'border-stone-200 bg-white'
        )}
      >
        {/* --- BEGIN COMMENT ---
        通知标题和图标
        --- END COMMENT --- */}
        <div className="mb-3 flex items-start gap-3">
          <div className={cn('flex-shrink-0 rounded-lg p-2', typeStyles.bg)}>
            <div className={typeStyles.color}>{typeStyles.icon}</div>
          </div>
          <div className="flex-1">
            <h3
              className={cn(
                'text-lg font-semibold',
                isDark ? 'text-stone-100' : 'text-stone-900'
              )}
            >
              {notification.title}
            </h3>
          </div>
        </div>

        {/* --- BEGIN COMMENT ---
        通知内容
        --- END COMMENT --- */}
        <p
          className={cn(
            'mb-4 text-sm',
            isDark ? 'text-stone-300' : 'text-stone-600'
          )}
        >
          {notification.content}
        </p>

        {/* --- BEGIN COMMENT ---
        操作按钮
        --- END COMMENT --- */}
        <div className="flex justify-end">
          <button
            className={cn(
              'rounded-md px-4 py-2 text-sm font-medium transition-colors',
              isDark
                ? 'bg-stone-700 text-stone-200 hover:bg-stone-600'
                : 'bg-stone-200 text-stone-800 hover:bg-stone-300'
            )}
          >
            知道了
          </button>
        </div>
      </div>
    </div>
  );

  // --- BEGIN COMMENT ---
  // 顶部横幅通知 - 预览版本
  // --- END COMMENT ---
  const renderTopNotification = () => (
    <div
      className={cn(
        'absolute top-16 right-0 left-0 border-b shadow-lg',
        isDark ? 'border-stone-600 bg-stone-800' : 'border-stone-200 bg-white'
      )}
    >
      <div className="mx-auto max-w-4xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn('rounded-lg p-2', typeStyles.bg)}>
              <span className={typeStyles.color}>{typeStyles.icon}</span>
            </div>
            <div>
              <h4
                className={cn(
                  'mb-1 font-semibold',
                  isDark ? 'text-stone-100' : 'text-stone-900'
                )}
              >
                {notification.title}
              </h4>
              <p
                className={cn(
                  'text-sm',
                  isDark ? 'text-stone-300' : 'text-stone-600'
                )}
              >
                {notification.content}
              </p>
            </div>
          </div>
          <button
            className={cn(
              'rounded-full p-2 transition-colors hover:bg-stone-500/10',
              isDark ? 'text-stone-400' : 'text-stone-500'
            )}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  // --- BEGIN COMMENT ---
  // 右下角通知 - 预览版本
  // --- END COMMENT ---
  const renderBottomRightNotification = () => (
    <div
      className={cn(
        'absolute right-6 bottom-6 max-w-sm rounded-xl border shadow-xl',
        isDark ? 'border-stone-600 bg-stone-800' : 'border-stone-200 bg-white'
      )}
    >
      <div className="p-5">
        <div className="flex items-start gap-3">
          <div className={cn('flex-shrink-0 rounded-lg p-2', typeStyles.bg)}>
            <span className={typeStyles.color}>{typeStyles.icon}</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center justify-between">
              <h4
                className={cn(
                  'text-sm font-semibold',
                  isDark ? 'text-stone-100' : 'text-stone-900'
                )}
              >
                {notification.title}
              </h4>
              <button
                className={cn(
                  'rounded-full p-1 transition-colors hover:bg-stone-500/10',
                  isDark ? 'text-stone-400' : 'text-stone-500'
                )}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
            <p
              className={cn(
                'text-xs leading-relaxed',
                isDark ? 'text-stone-300' : 'text-stone-600'
              )}
            >
              {notification.content}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className={cn(
        'relative h-full w-full overflow-hidden',
        isDark ? 'bg-stone-900' : 'bg-stone-50'
      )}
    >
      {/* --- BEGIN COMMENT ---
      模拟完整页面背景 - 参考About预览的结构
      --- END COMMENT --- */}
      <div className="h-full w-full">
        {/* 模拟导航栏 */}
        <div
          className={cn(
            'flex h-16 items-center border-b px-6',
            isDark
              ? 'border-stone-600 bg-stone-800'
              : 'border-stone-200 bg-white'
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'h-8 w-8 rounded-lg',
                isDark ? 'bg-stone-700' : 'bg-stone-100'
              )}
            />
            <h1
              className={cn(
                'text-lg font-semibold',
                isDark ? 'text-stone-100' : 'text-stone-900'
              )}
            >
              AgentifUI
            </h1>
          </div>
        </div>

        {/* 主内容区域 */}
        <div className="h-[calc(100%-4rem)] overflow-y-auto p-6">
          <div className="mx-auto max-w-4xl">
            <div className="mb-8">
              <h1
                className={cn(
                  'mb-4 text-3xl font-bold',
                  isDark ? 'text-stone-100' : 'text-stone-900'
                )}
              >
                欢迎使用 AgentifUI
              </h1>
              <p
                className={cn(
                  'mb-6 text-lg',
                  isDark ? 'text-stone-300' : 'text-stone-600'
                )}
              >
                这是一个完整的页面预览，用于展示通知在实际应用中的显示效果。
              </p>
            </div>

            {/* 模拟内容卡片 */}
            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
              {[1, 2, 3, 4].map(i => (
                <div
                  key={i}
                  className={cn(
                    'rounded-xl border p-6',
                    isDark
                      ? 'border-stone-600 bg-stone-800'
                      : 'border-stone-200 bg-white'
                  )}
                >
                  <div
                    className={cn(
                      'mb-4 h-12 w-12 rounded-lg',
                      isDark ? 'bg-stone-700' : 'bg-stone-100'
                    )}
                  />
                  <h3
                    className={cn(
                      'mb-2 text-lg font-semibold',
                      isDark ? 'text-stone-100' : 'text-stone-900'
                    )}
                  >
                    功能模块 {i}
                  </h3>
                  <p
                    className={cn(
                      'text-sm',
                      isDark ? 'text-stone-400' : 'text-stone-600'
                    )}
                  >
                    这里是一些示例内容，用于展示通知在真实页面环境中的显示效果和层级关系。
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* --- BEGIN COMMENT ---
      渲染通知 (仅在激活时显示)
      --- END COMMENT --- */}
      {renderNotification()}
    </div>
  );
};

// --- BEGIN COMMENT ---
// 通知预览包装器组件 - 处理空状态
// --- END COMMENT ---
interface NotificationPreviewWrapperProps {
  notification: NotificationConfig | null;
}

export const NotificationPreviewWrapper: React.FC<
  NotificationPreviewWrapperProps
> = ({ notification }) => {
  const { isDark } = useTheme();

  if (!notification) {
    return (
      <div
        className={cn(
          'flex h-full items-center justify-center',
          isDark ? 'bg-stone-900' : 'bg-stone-50'
        )}
      >
        <div
          className={cn(
            'rounded-xl border p-8 text-center',
            isDark
              ? 'border-stone-600 bg-stone-800'
              : 'border-stone-200 bg-white'
          )}
        >
          <Bell
            className={cn(
              'mx-auto mb-4 h-12 w-12',
              isDark ? 'text-stone-600' : 'text-stone-400'
            )}
          />
          <p
            className={cn(
              'mb-2 text-lg font-medium',
              isDark ? 'text-stone-300' : 'text-stone-600'
            )}
          >
            选择通知预览
          </p>
          <p
            className={cn(
              'text-sm',
              isDark ? 'text-stone-400' : 'text-stone-500'
            )}
          >
            从左侧选择一个通知来预览其显示效果
          </p>
        </div>
      </div>
    );
  }

  return <NotificationPreview notification={notification} />;
};

export default NotificationPreviewWrapper;
