'use client';

import { Spinner } from '@components/ui/spinner';
import { TooltipWrapper } from '@components/ui/tooltip-wrapper';
import {
  AttachmentFile,
  useAttachmentStore,
} from '@lib/stores/attachment-store';
import { cn, formatBytes } from '@lib/utils';
import { CheckCircle2Icon, FileTextIcon, RotateCcw, XIcon } from 'lucide-react';

import React from 'react';

import { useTranslations } from 'next-intl';

/**
 * 单个附件预览项的 Props 定义
 * 使用石色(stone)调色板，与应用整体风格一致
 */
interface AttachmentPreviewItemProps {
  attachment: AttachmentFile;
  isDark?: boolean;
  onRetry: (id: string) => void;
}

/**
 * 圆形进度条组件 (无文字)
 * 使用石色(stone)调色板，与应用整体风格一致
 */
const CircularProgress: React.FC<{
  progress: number;
  size?: number;
  strokeWidth?: number;
  isDark?: boolean;
}> = ({ progress, size = 20, strokeWidth = 2, isDark = false }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  // 确保进度在 0-100 之间，防止 offset 计算错误
  const safeProgress = Math.max(0, Math.min(100, progress));
  const offset = circumference - (safeProgress / 100) * circumference;

  return (
    <svg
      width={size}
      height={size}
      className="absolute inset-0 m-auto -rotate-90 transform"
    >
      {/* 背景圆环 */}
      <circle
        className={cn(
          isDark ? 'text-stone-600' : 'text-stone-300' // 石色背景环
        )}
        strokeWidth={strokeWidth}
        stroke="currentColor"
        fill="transparent"
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
      {/* 进度圆环 */}
      <circle
        className={cn(
          'transition-all duration-300 ease-linear',
          isDark ? 'text-stone-300' : 'text-stone-700' // 石色进度环
        )}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        stroke="currentColor"
        fill="transparent"
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
    </svg>
  );
};

/**
 * 单个附件预览项组件 (简约风格)
 * 使用石色(stone)调色板，与应用整体风格一致
 */
export const AttachmentPreviewItem: React.FC<AttachmentPreviewItemProps> = ({
  attachment,
  isDark = false,
  onRetry,
}) => {
  const removeFile = useAttachmentStore(state => state.removeFile);
  const t = useTranslations('common.ui');

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeFile(attachment.id);
  };

  const handleRetryClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRetry(attachment.id);
  };

  const StatusIcon = () => {
    switch (attachment.status) {
      case 'uploading':
        return <Spinner size="sm" />;
      case 'success':
        return (
          <CheckCircle2Icon
            className={cn(
              'h-4 w-4',
              isDark ? 'text-stone-400' : 'text-stone-500'
            )}
          />
        );
      case 'error':
        return (
          <TooltipWrapper
            content={t('retry')}
            placement="top"
            id={`retry-att-${attachment.id}`}
            size="sm"
            showArrow={false}
          >
            <button
              type="button"
              onClick={handleRetryClick}
              className={cn(
                'flex h-full w-full items-center justify-center rounded-full',
                isDark
                  ? 'text-stone-400 hover:bg-stone-800/50'
                  : 'text-stone-500 hover:bg-stone-100/50',
                'focus:outline-none',
                'transition-colors duration-150'
              )}
              aria-label={t('retry')}
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </TooltipWrapper>
        );
      case 'pending':
      default:
        return (
          <FileTextIcon
            className={cn(
              'h-4 w-4',
              isDark ? 'text-stone-400' : 'text-stone-500'
            )}
          />
        );
    }
  };

  return (
    <div
      className={cn(
        'relative flex items-center gap-2 rounded-md py-1 pr-1 pl-2',
        'flex-shrink basis-[calc((100%-1.5rem)/3)] sm:basis-[calc((100%-1rem)/2)]',
        'max-w-[180px] sm:max-w-[200px]',
        isDark
          ? 'border border-stone-700/80 bg-stone-800/90'
          : 'border border-stone-200 bg-stone-100',
        attachment.status === 'error' &&
          (isDark ? 'border-red-500/30' : 'border-red-400/30')
      )}
      title={
        attachment.error
          ? `${t('error')}: ${attachment.error}`
          : attachment.name
      }
    >
      <div className="relative flex h-5 w-5 flex-shrink-0 items-center justify-center">
        <StatusIcon />
      </div>

      <div className="min-w-0 flex-grow">
        <p
          className={cn(
            'truncate font-serif text-sm font-medium',
            isDark ? 'text-stone-100' : 'text-stone-900'
          )}
        >
          {attachment.name}
        </p>
        <p
          className={cn(
            'font-serif text-xs',
            isDark ? 'text-stone-400' : 'text-stone-500'
          )}
        >
          {formatBytes(attachment.size)}
        </p>
      </div>

      <TooltipWrapper
        content={t('remove')}
        placement="top"
        id={`remove-att-${attachment.id}`}
        size="sm"
        showArrow={false}
      >
        <button
          type="button"
          onClick={handleRemove}
          className={cn(
            'ml-auto flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full transition-colors',
            isDark
              ? 'bg-stone-700/80 text-stone-300 hover:bg-stone-600/80 hover:text-white'
              : 'bg-stone-300/50 text-stone-600 hover:bg-stone-400/70 hover:text-black'
          )}
          aria-label={t('remove')}
        >
          <XIcon className="h-4 w-4" />
        </button>
      </TooltipWrapper>
    </div>
  );
};
