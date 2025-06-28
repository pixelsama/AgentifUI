'use client';

import { useTheme } from '@lib/hooks/use-theme';
import { cn } from '@lib/utils';
import { Activity, FileText, History } from 'lucide-react';

import React from 'react';

import { useTranslations } from 'next-intl';

type MobileTab = 'form' | 'tracker' | 'history';

interface MobileTabSwitcherProps {
  activeTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
  hasHistory: boolean;
}

/**
 * 移动端标签切换器组件
 *
 * 在移动端提供表单、跟踪器、历史记录之间的切换
 */
export function MobileTabSwitcher({
  activeTab,
  onTabChange,
  hasHistory,
}: MobileTabSwitcherProps) {
  const { isDark } = useTheme();
  const t = useTranslations('pages.workflow.tabs');

  const tabs = [
    {
      id: 'form' as const,
      label: t('inputForm'),
      icon: FileText,
    },
    {
      id: 'tracker' as const,
      label: t('executionStatus'),
      icon: Activity,
    },
    {
      id: 'history' as const,
      label: t('history'),
      icon: History,
    },
  ];

  return (
    <div
      className={cn(
        'flex border-b',
        isDark ? 'border-stone-700 bg-stone-900' : 'border-stone-200 bg-white'
      )}
    >
      {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 px-4 py-3 font-serif text-sm transition-colors',
              isActive
                ? isDark
                  ? 'border-b-2 border-stone-400 text-stone-100'
                  : 'border-b-2 border-stone-600 text-stone-900'
                : isDark
                  ? 'text-stone-400 hover:text-stone-300'
                  : 'text-stone-600 hover:text-stone-700'
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
