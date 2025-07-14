'use client';

import { useNotificationStore } from '@lib/stores/ui/notification-store';
import { cn } from '@lib/utils';
import {
  AlertTriangleIcon,
  CheckCircleIcon,
  InfoIcon,
  XCircleIcon,
  XIcon,
} from 'lucide-react';

import React from 'react';

const iconMap = {
  success: CheckCircleIcon,
  error: XCircleIcon,
  warning: AlertTriangleIcon,
  info: InfoIcon,
};

const colorMap = {
  success: 'bg-green-500 border-green-600',
  error: 'bg-red-500 border-red-600',
  warning: 'bg-yellow-500 border-yellow-600',
  info: 'bg-stone-500 border-stone-600',
};

export const NotificationBar: React.FC = () => {
  const { message, type, isVisible, hideNotification } = useNotificationStore();

  // 如果不可见或没有消息，则不渲染任何内容
  if (!isVisible || !message) {
    return null;
  }

  const IconComponent = iconMap[type] || InfoIcon; // 默认使用 InfoIcon
  const colors = colorMap[type] || colorMap.info; // 默认使用 info 颜色

  return (
    <div
      className={cn(
        'fixed top-5 left-1/2 z-50 -translate-x-1/2 transform', // 定位在顶部居中
        'w-auto max-w-[90%] md:max-w-md lg:max-w-lg', // 响应式宽度
        'flex items-center space-x-3 rounded-md border p-3 text-white shadow-lg', // 基础样式
        colors, // 根据类型应用颜色
        'transition-all duration-300 ease-in-out', // 过渡动画
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0' // 显示/隐藏动画
      )}
      role="alert"
    >
      <IconComponent className="h-5 w-5 flex-shrink-0" />
      <span className="flex-grow text-sm font-medium">{message}</span>
      <button
        onClick={hideNotification}
        className="flex-shrink-0 rounded-full p-1 transition-colors hover:bg-white/20"
        aria-label="关闭通知"
      >
        <XIcon className="h-4 w-4" />
      </button>
    </div>
  );
};
