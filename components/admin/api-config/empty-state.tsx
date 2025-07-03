'use client';

import { useTheme } from '@lib/hooks/use-theme';
import { cn } from '@lib/utils';
import { Settings } from 'lucide-react';

export const EmptyState = () => {
  const { isDark } = useTheme();

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <div className="text-center">
        <Settings className="mx-auto mb-4 h-16 w-16 text-stone-400" />
        <h3
          className={cn(
            'mb-2 font-serif text-lg font-medium',
            isDark ? 'text-stone-300' : 'text-stone-700'
          )}
        >
          选择应用实例
        </h3>
        <p
          className={cn(
            'font-serif text-sm',
            isDark ? 'text-stone-400' : 'text-stone-600'
          )}
        >
          从左侧列表中选择一个应用实例来查看和编辑其配置，或点击添加按钮创建新的应用实例
        </p>
      </div>
    </div>
  );
};
