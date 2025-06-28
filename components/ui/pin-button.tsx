'use client';

import { useTheme } from '@lib/hooks/use-theme';
import { cn } from '@lib/utils';
import { Pin } from 'lucide-react';

import React from 'react';

import { TooltipWrapper } from './tooltip-wrapper';

interface PinButtonProps {
  isPinned: boolean;
  onClick: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  tooltipSize?: 'sm' | 'md'; // tooltip尺寸
  showTooltipArrow?: boolean; // 是否显示tooltip箭头
}

export function PinButton({
  isPinned,
  onClick,
  className,
  size = 'md',
  tooltipSize = 'sm',
  showTooltipArrow = false,
}: PinButtonProps) {
  const { isDark } = useTheme();

  const sizeClasses = {
    sm: 'p-1.5 text-xs',
    md: 'p-2 text-sm',
    lg: 'p-2.5 text-base',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <TooltipWrapper
      id="pin-tooltip"
      content={isPinned ? '取消固定' : '固定'}
      placement="top"
      size={tooltipSize}
      showArrow={showTooltipArrow}
      desktopOnly={true}
    >
      <button
        className={cn(
          'rounded-full transition-all duration-200',
          'flex items-center justify-center',
          sizeClasses[size],
          isPinned
            ? isDark
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
            : isDark
              ? 'text-gray-400 hover:bg-gray-700/60 hover:text-gray-200'
              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700',
          className
        )}
        onClick={onClick}
        aria-label={isPinned ? '取消固定' : '固定'}
      >
        <Pin className={cn(iconSizes[size], isPinned ? 'rotate-45' : '')} />
      </button>
    </TooltipWrapper>
  );
}
