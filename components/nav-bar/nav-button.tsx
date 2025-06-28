'use client';

import { useTheme } from '@lib/hooks/use-theme';
import { cn } from '@lib/utils';

import React from 'react';

interface NavButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
  children: React.ReactNode;
}

// --- BEGIN COMMENT ---
// NavBar 专属的可重用按钮组件
// 设计为圆角、响应式，并支持亮/暗主题
// --- END COMMENT ---
export function NavButton({
  icon,
  children,
  className,
  ...props
}: NavButtonProps) {
  const { isDark } = useTheme();

  return (
    <button
      className={cn(
        // 基础样式
        'flex items-center justify-center gap-2 rounded-md px-3 py-1.5 transition-colors duration-150',
        // 字体和大小 (可按需调整)
        'text-sm font-medium',
        // 响应式调整 (如果需要)
        // "sm:px-4 sm:py-2",
        // 主题感知悬停效果
        isDark
          ? 'text-gray-300 hover:bg-gray-700/50 hover:text-gray-100'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
        // 禁用状态
        'disabled:pointer-events-none disabled:opacity-50',
        // 外部传入的类名
        className
      )}
      {...props}
    >
      {icon && <span className="h-4 w-4 flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}
