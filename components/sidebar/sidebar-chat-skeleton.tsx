'use client';

import { cn } from '@lib/utils';
import { MessageSquare } from 'lucide-react';

import * as React from 'react';

interface SidebarChatSkeletonProps {
  isDark: boolean;
}

/**
 * 侧边栏聊天项骨架屏组件
 *
 * 用于显示正在创建的新对话的占位符
 */
export function SidebarChatSkeleton({ isDark }: SidebarChatSkeletonProps) {
  // --- BEGIN COMMENT ---
  // 骨架屏组件，显示对话创建中的加载状态
  // 样式与 SidebarButton 保持一致，确保尺寸和外观一致
  // --- END COMMENT ---
  return (
    <div
      className={cn(
        'flex w-full items-center rounded-lg px-3 py-2',
        'animate-pulse',
        isDark ? 'bg-stone-800/50' : 'bg-stone-100/70',
        'h-10' // 与 SidebarButton 保持一致的高度
      )}
    >
      {/* 图标 */}
      <div
        className={cn(
          'flex h-6 w-6 flex-none items-center justify-center rounded-full',
          isDark ? 'bg-stone-700' : 'bg-stone-300'
        )}
      >
        <MessageSquare
          size={14}
          className={cn(isDark ? 'text-stone-500' : 'text-stone-400')}
        />
      </div>

      {/* 标题骨架屏 - 只显示一行标题 */}
      <div className="ml-3 flex min-w-0 flex-1 items-center">
        <div
          className={cn(
            'h-4 w-32 rounded',
            isDark ? 'bg-stone-700' : 'bg-stone-300'
          )}
        />
      </div>
    </div>
  );
}
