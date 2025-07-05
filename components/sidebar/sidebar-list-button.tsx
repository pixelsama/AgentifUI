'use client';

import { useTheme } from '@lib/hooks/use-theme';
import { cn } from '@lib/utils';

import type * as React from 'react';

// SidebarListButton 组件
// 专门为侧边栏列表项设计的按钮组件，样式更加紧凑和美观
// 不同于 SidebarButton，此组件不会占满整个侧边栏宽度
// 支持响应式布局，在移动端和桌面端有不同的表现
// 🎯 新增：支持more button和item区域的悬停分离效果
interface SidebarListButtonProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: React.ReactNode;
  active?: boolean;
  isLoading?: boolean;
  moreActionsTrigger?: React.ReactNode;
  isDisabled?: boolean;
  children?: React.ReactNode;
  hasOpenDropdown?: boolean; // 是否有打开的下拉菜单
  disableHover?: boolean; // 是否禁用悬停效果（当有其他菜单打开时）
}

export function SidebarListButton({
  icon,
  active = false,
  isLoading = false,
  className,
  onClick,
  moreActionsTrigger,
  isDisabled = false,
  hasOpenDropdown = false,
  disableHover = false,
  children,
  ...props
}: SidebarListButtonProps) {
  const { isDark } = useTheme();

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDisabled) return;
    onClick?.(e);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isDisabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const mockEvent = {
        ...e,
        type: 'click',
      } as unknown as React.MouseEvent<HTMLDivElement>;
      onClick?.(mockEvent);
    }
  };

  // 🎯 处理主要内容区域的点击（排除more button区域）
  const handleMainContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // 只有点击主要内容区域时才触发选择
    handleClick(e);
  };

  return (
    <div
      role="button"
      tabIndex={isDisabled ? -1 : 0}
      aria-disabled={isDisabled}
      className={cn(
        // 基础样式 - 🎯 进一步减小内边距，使按钮更加紧凑
        // 从 px-2.5 py-1.5 改为 px-2 py-1，减小整体尺寸
        'group relative flex items-center rounded-lg px-2 py-1 text-sm font-medium',
        'transition-all duration-300 ease-out',

        // 焦点状态样式
        'outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        isDark
          ? 'focus-visible:ring-stone-500 focus-visible:ring-offset-gray-900'
          : 'focus-visible:ring-primary focus-visible:ring-offset-background',

        // 边框样式
        'border',

        // 禁用状态样式
        // 恢复cursor-pointer，现在父容器使用cursor-e-resize不会冲突
        // disabled时使用cursor-not-allowed
        isDisabled
          ? 'cursor-not-allowed border-transparent opacity-60'
          : 'cursor-pointer',

        // 🎯 亮色主题样式 - 统一悬停效果与header保持一致
        !isDark &&
          !isDisabled && [
            'text-stone-600',
            // 只有在没有打开下拉菜单且没有禁用悬停时才显示悬停效果
            !hasOpenDropdown && !disableHover && 'hover:bg-stone-300/80',
            active
              ? 'border-stone-400/80 bg-stone-300 shadow-sm'
              : 'border-transparent',
          ],
        !isDark && isDisabled && ['text-stone-400'],

        // 🎯 暗色主题样式 - 统一悬停效果与header保持一致
        isDark &&
          !isDisabled && [
            'text-gray-200',
            // 只有在没有打开下拉菜单且没有禁用悬停时才显示悬停效果
            !hasOpenDropdown && !disableHover && 'hover:bg-stone-600/60',
            active
              ? 'border-stone-600 bg-stone-700 shadow-sm'
              : 'border-transparent',
          ],
        isDark && isDisabled && ['text-gray-500'],

        // 响应式宽度样式
        'w-full', // 默认宽度为100%

        className
      )}
      onKeyDown={handleKeyDown}
      {...props}
    >
      {/* Main content area: contains icon and text, handles click events */}
      {/* Removed independent hover effects, uses overall hover effect */}
      <div
        className={cn(
          'flex min-w-0 flex-1 items-center',
          // 恢复cursor-pointer，确保按钮区域有明确的交互提示
          !isDisabled && 'cursor-pointer'
        )}
        onClick={handleMainContentClick}
      >
        {isLoading ? (
          <span className={cn('flex h-4 w-4 items-center justify-center')}>
            <div
              className={cn(
                'h-3 w-3 animate-pulse rounded-full',
                isDark ? 'bg-stone-600' : 'bg-stone-400',
                'opacity-80'
              )}
            />
          </span>
        ) : (
          <span
            className={cn(
              '-ml-0.5 flex h-4 w-4 items-center justify-center',
              isDark ? 'text-gray-400' : 'text-gray-500'
            )}
          >
            {icon}
          </span>
        )}
        {children && (
          <div className="ml-1.5 min-w-0 flex-1 truncate">{children}</div>
        )}
      </div>

      {/* More Actions area: independent hover and click handling */}
      {/* Uses higher CSS priority to override overall hover effects */}
      {moreActionsTrigger && (
        <div
          className={cn(
            'relative z-10 ml-0.5 flex-shrink-0'
            // 🎯 More button区域的独立悬停效果，覆盖整体悬停
            // 使用 hover:bg-transparent 来"取消"父级的悬停效果
          )}
          onClick={e => {
            e.stopPropagation(); // 防止点击 MoreButton 区域时选中聊天项
          }}
        >
          {moreActionsTrigger}
        </div>
      )}
    </div>
  );
}
