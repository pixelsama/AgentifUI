'use client';

import { useTheme } from '@lib/hooks/use-theme';
import { cn } from '@lib/utils';
import { Check, CheckSquare, Square, Trash2, X } from 'lucide-react';

import * as React from 'react';

import { useTranslations } from 'next-intl';

// 历史对话选择操作栏组件
// 提供全选、取消选择和批量删除功能
interface HistorySelectionBarProps {
  isSelectionMode: boolean;
  selectedCount: number;
  totalCount: number;
  onToggleSelectionMode: () => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onBatchDelete: () => void;
  onCancelSelection: () => void;
  isDeleting?: boolean;
}

export function HistorySelectionBar({
  isSelectionMode,
  selectedCount,
  totalCount,
  onToggleSelectionMode,
  onSelectAll,
  onDeselectAll,
  onBatchDelete,
  onCancelSelection,
  isDeleting = false,
}: HistorySelectionBarProps) {
  const { isDark } = useTheme();
  const t = useTranslations('history');

  // 如果不在选择模式且没有选中项，则不显示操作栏
  if (!isSelectionMode && selectedCount === 0) {
    return null;
  }

  const allSelected = selectedCount === totalCount && totalCount > 0;
  const hasSelection = selectedCount > 0;

  return (
    <div
      className={cn(
        'sticky top-0 z-10 transition-all duration-300 ease-in-out',
        'mb-4 rounded-xl backdrop-blur-sm',
        'bg-gradient-to-r',
        isDark
          ? 'border border-stone-600/50 from-stone-800/95 via-stone-800/90 to-stone-800/95 shadow-lg shadow-stone-900/20'
          : 'border border-stone-200/80 from-stone-50/95 via-white/90 to-stone-50/95 shadow-lg shadow-stone-900/10'
      )}
    >
      <div className="px-6 py-2.5">
        <div className="flex items-center justify-between">
          {/* --- 左侧：选择状态和全选按钮 --- */}
          <div className="flex items-center space-x-4">
            {/* 全选/取消全选按钮 */}
            <button
              onClick={allSelected ? onDeselectAll : onSelectAll}
              className={cn(
                'flex items-center space-x-2 rounded-md px-3 py-1.5',
                'transition-all duration-200 ease-in-out',
                'font-serif text-sm font-medium',
                'hover:scale-105 hover:shadow-md',
                isDark
                  ? 'border border-stone-600 text-stone-300 hover:bg-stone-700'
                  : 'border border-stone-300 text-stone-600 hover:bg-stone-200'
              )}
              disabled={totalCount === 0}
            >
              {allSelected ? (
                <CheckSquare className="h-3.5 w-3.5" />
              ) : (
                <Square className="h-3.5 w-3.5" />
              )}
              <span>{allSelected ? t('deselectAll') : t('selectAll')}</span>
            </button>

            {/* 选择状态显示 */}
            {hasSelection && (
              <div
                className={cn(
                  'font-serif text-xs',
                  isDark ? 'text-stone-400' : 'text-stone-500'
                )}
              >
                {t('selected', { count: selectedCount, total: totalCount })}
              </div>
            )}
          </div>

          {/* --- 右侧：操作按钮 --- */}
          <div className="flex items-center space-x-2">
            {/* 批量删除按钮 */}
            {hasSelection && (
              <button
                onClick={onBatchDelete}
                disabled={isDeleting}
                className={cn(
                  'flex items-center space-x-2 rounded-md px-3 py-1.5',
                  'transition-all duration-200 ease-in-out',
                  'font-serif text-sm font-medium',
                  'hover:scale-105 hover:shadow-lg',
                  isDeleting && 'cursor-not-allowed opacity-50',
                  isDark
                    ? 'border border-red-800 bg-red-900/40 text-red-300 shadow-md shadow-red-900/20 hover:bg-red-900/60'
                    : 'border border-red-300 bg-red-50 text-red-700 shadow-md shadow-red-900/10 hover:bg-red-100'
                )}
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>
                  {isDeleting
                    ? t('deleting')
                    : t('deleteCount', { count: selectedCount })}
                </span>
              </button>
            )}

            {/* 取消选择按钮 */}
            <button
              onClick={onCancelSelection}
              className={cn(
                'flex items-center space-x-1 rounded-md px-3 py-1.5',
                'transition-all duration-200 ease-in-out',
                'font-serif text-sm font-medium',
                'hover:scale-105 hover:shadow-md',
                isDark
                  ? 'border border-stone-600 text-stone-400 hover:bg-stone-700'
                  : 'border border-stone-300 text-stone-500 hover:bg-stone-200'
              )}
            >
              <X className="h-3.5 w-3.5" />
              <span>{t('cancel')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
