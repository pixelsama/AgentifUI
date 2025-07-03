'use client';

import { Button } from '@components/ui/button';
import { useTheme } from '@lib/hooks/use-theme';
import { cn } from '@lib/utils';
import { Loader2, Rocket } from 'lucide-react';
import { toast } from 'sonner';

import { useState } from 'react';

export function RebuildButton() {
  const [isLoading, setIsLoading] = useState(false);
  const { isDark } = useTheme();

  const handleRebuild = async () => {
    setIsLoading(true);
    toast.info('开始重新编译和部署...', {
      description: '这个过程可能需要几分钟，请保持耐心。',
    });

    try {
      const response = await fetch('/api/admin/rebuild', {
        method: 'POST',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '发生未知错误');
      }

      toast.success('构建成功，正在重启应用...', {
        description: result.message,
      });
    } catch (error: any) {
      toast.error('部署失败', {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleRebuild}
      disabled={isLoading}
      className={cn(
        'flex cursor-pointer items-center gap-2 rounded-lg px-3 py-1.5 transition-all duration-200',
        'border',
        isDark
          ? 'border-stone-600/50 bg-stone-700/50 text-stone-300 hover:border-stone-500 hover:bg-stone-600 hover:text-stone-100'
          : 'border-stone-200 bg-stone-100/80 text-stone-600 hover:border-stone-300 hover:bg-stone-200 hover:text-stone-900',
        'disabled:cursor-not-allowed disabled:opacity-50'
      )}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Rocket className="h-4 w-4" />
      )}
      <span className="hidden text-sm sm:inline">重新编译</span>
    </button>
  );
}
