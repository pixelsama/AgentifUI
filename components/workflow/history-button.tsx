'use client';

import { useTheme } from '@lib/hooks/use-theme';
import { cn } from '@lib/utils';
import { History } from 'lucide-react';

import React from 'react';

import { useTranslations } from 'next-intl';

interface HistoryButtonProps {
  onClick: () => void;
  isActive: boolean;
  className?: string;
}

/**
 * 历史记录按钮组件
 *
 * 固定在右上角的浮动按钮，用于打开/关闭历史记录侧边栏
 */
export function HistoryButton({
  onClick,
  isActive,
  className,
}: HistoryButtonProps) {
  const { isDark } = useTheme();
  const t = useTranslations('pages.workflow.history');

  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-full p-3 shadow-lg transition-all duration-200',
        'hover:scale-105 hover:shadow-xl',
        isActive
          ? isDark
            ? 'bg-stone-600 text-stone-100'
            : 'bg-stone-700 text-white'
          : isDark
            ? 'bg-stone-800 text-stone-300 hover:bg-stone-700'
            : 'bg-white text-stone-600 hover:bg-stone-50',
        className
      )}
      title={isActive ? t('hideHistory') : t('showHistory')}
    >
      <History className="h-5 w-5" />
    </button>
  );
}
