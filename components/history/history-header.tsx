'use client';

import { useTheme } from '@lib/hooks/use-theme';
import { cn } from '@lib/utils';
import { ArrowLeft } from 'lucide-react';

import * as React from 'react';

import { useRouter } from 'next/navigation';

// 历史对话页面的头部组件
// 包含标题和返回按钮
export function HistoryHeader() {
  const { isDark } = useTheme();
  const router = useRouter();

  return (
    <header
      className={cn(
        'flex items-center justify-between border-b px-4 py-4 md:px-8 lg:px-12',
        isDark ? 'border-stone-800 bg-stone-900' : 'border-stone-200 bg-white'
      )}
    >
      <div className="flex items-center">
        <button
          onClick={() => router.back()}
          className={cn(
            'mr-4 rounded-full p-2',
            'transition-colors duration-200',
            isDark
              ? 'text-stone-400 hover:bg-stone-800 hover:text-stone-300'
              : 'text-stone-500 hover:bg-stone-100 hover:text-stone-700'
          )}
          aria-label="返回"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <h1
          className={cn(
            'font-serif text-xl font-medium',
            isDark ? 'text-stone-100' : 'text-stone-800'
          )}
        >
          历史对话
        </h1>
      </div>
    </header>
  );
}
