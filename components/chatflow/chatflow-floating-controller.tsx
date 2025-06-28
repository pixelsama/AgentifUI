'use client';

import { useTheme } from '@lib/hooks/use-theme';
import { useChatflowExecutionStore } from '@lib/stores/chatflow-execution-store';
import { cn } from '@lib/utils';
import { Workflow } from 'lucide-react';

import React, { useState } from 'react';

import { useTranslations } from 'next-intl';

interface ChatflowFloatingControllerProps {
  isVisible: boolean;
  isTrackerVisible: boolean;
  onToggleTracker: () => void;
  onClose: () => void;
  className?: string;
}

/**
 * Chatflow 悬浮控制器组件
 *
 * 功能：
 * - 悬浮球形式的控制器
 * - 点击直接切换节点跟踪器的显示/隐藏
 * - 临时UI，可以完全关闭
 */
export function ChatflowFloatingController({
  isVisible,
  isTrackerVisible,
  onToggleTracker,
  onClose,
  className,
}: ChatflowFloatingControllerProps) {
  const { isDark } = useTheme();
  const t = useTranslations('pages.chatflow.floatingController');

  // 从 store 获取执行状态
  const nodes = useChatflowExecutionStore(state => state.nodes);
  const isExecuting = useChatflowExecutionStore(state => state.isExecuting);
  const error = useChatflowExecutionStore(state => state.error);

  // 只要isVisible为true就显示悬浮球，不管是否有节点执行
  if (!isVisible) {
    return null;
  }

  const handleToggleTracker = () => {
    onToggleTracker();
  };

  const getStatusColor = () => {
    if (error) return 'text-red-500';
    if (isExecuting) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <div className={cn('fixed right-4 bottom-24 z-20', className)}>
      {/* 悬浮球 - 点击直接切换节点跟踪器 */}
      <button
        onClick={handleToggleTracker}
        className={cn(
          'h-12 w-12 rounded-full shadow-lg transition-all duration-200',
          'flex items-center justify-center',
          'hover:scale-105 hover:shadow-xl active:scale-95',
          isDark
            ? 'border border-stone-700 bg-stone-800 text-stone-200 hover:bg-stone-700'
            : 'border border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
        )}
        title={isTrackerVisible ? t('hideTracker') : t('showTracker')}
      >
        <Workflow className={cn('h-5 w-5', getStatusColor())} />
      </button>
    </div>
  );
}
