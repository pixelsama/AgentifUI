'use client';

import { useTheme } from '@lib/hooks';
import { cn } from '@lib/utils';
import { IconType } from 'react-icons';

import React from 'react';

import { TooltipWrapper } from './tooltip-wrapper';

interface MessageActionButtonProps {
  icon: IconType;
  activeIcon?: IconType; // 激活状态图标（可选）
  label: string;
  activeLabel?: string; // 激活状态标签（可选）
  onClick: () => void;
  className?: string;
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
  disabled?: boolean;
  active?: boolean; // 是否处于激活状态
  tooltipSize?: 'sm' | 'md'; // tooltip尺寸
  showTooltipArrow?: boolean; // 是否显示tooltip箭头
}

export const MessageActionButton: React.FC<MessageActionButtonProps> = ({
  icon: Icon,
  activeIcon: ActiveIcon,
  label,
  activeLabel,
  onClick,
  className,
  tooltipPosition = 'bottom',
  disabled = false,
  active = false,
  tooltipSize = 'sm', // message-actions默认使用小尺寸
  showTooltipArrow = false, // message-actions默认不显示箭头
}) => {
  const { isDark } = useTheme();
  // 使用外部传入的active属性控制状态，而不是内部状态
  // 当前显示的图标和标签
  // 如果处于激活状态且提供了激活图标，则使用激活图标
  const DisplayIcon = active && ActiveIcon ? ActiveIcon : Icon;
  const displayLabel = active && activeLabel ? activeLabel : label;

  // 创建唯一的tooltip ID
  const tooltipId = `tooltip-${displayLabel.replace(/\s+/g, '-').toLowerCase()}-${Math.random().toString(36).substring(2, 7)}`;

  const handleClick = () => {
    if (!disabled) {
      // 直接调用外部点击处理函数，不在内部管理状态
      onClick();
    }
  };

  const button = (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      aria-label={displayLabel}
      className={cn(
        'flex items-center justify-center rounded-md p-1.5 transition-all',
        'text-sm',
        // 按钮样式，激活状态下不改变背景
        isDark
          ? 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'
          : 'text-gray-500 hover:bg-gray-200/50 hover:text-gray-700',
        // 激活时保持原来的颜色，不使用蓝色
        disabled && 'cursor-not-allowed opacity-50 hover:bg-transparent',
        className
      )}
    >
      <DisplayIcon
        className={cn(
          'h-4 w-4',
          // 只有当没有提供激活图标时，才使用填充效果
          // 这样复制按钮会显示勾勾，而反馈按钮会填充原图标
          active && !ActiveIcon && 'fill-current'
        )}
      />
    </button>
  );

  // 如果按钮被禁用，不使用tooltip
  if (disabled) {
    return button;
  }

  // 使用TooltipWrapper包装按钮，传递新的tooltip属性
  return (
    <TooltipWrapper
      content={displayLabel}
      id={tooltipId}
      placement={tooltipPosition}
      size={tooltipSize}
      showArrow={showTooltipArrow}
      _desktopOnly={true}
    >
      {button}
    </TooltipWrapper>
  );
};
