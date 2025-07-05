'use client';

import { useMobile } from '@lib/hooks';
import { useSettingsColors } from '@lib/hooks/use-settings-colors';
import { useThemeColors } from '@lib/hooks/use-theme-colors';
import { useSidebarStore } from '@lib/stores/sidebar-store';
import { cn } from '@lib/utils';

import React from 'react';

import { usePathname } from 'next/navigation';

import { ConversationTitleButton } from './conversation-title-button';
import { DesktopUserAvatar } from './desktop-user-avatar';
import { WorkflowHistoryButton } from './workflow-history-button';

/**
 * 桌面端顶部导航栏组件
 * 特点：
 * - 仅在桌面视图显示 (md 及以上)
 * - 使用石色(stone)调色板，与应用整体风格一致
 * - 右上角显示用户头像按钮，点击弹出下拉菜单
 * - 左侧显示当前对话标题按钮（仅在历史对话页面）
 * - 布局会根据侧边栏的展开/收起状态动态调整左边距
 * - 在设置页面自动适配设置页面的背景色，实现完全融入效果
 */
export function NavBar() {
  const isMobile = useMobile();
  const pathname = usePathname();
  const { colors: themeColors } = useThemeColors();
  const { colors: settingsColors } = useSettingsColors();
  const { isExpanded } = useSidebarStore();

  if (isMobile) {
    return null;
  }

  // 🎯 根据当前页面路径选择合适的背景色
  // Settings页面使用settings专门的背景色，其他页面使用主题背景色
  // 确保navbar与页面完全融入，无违和感
  const isSettingsPage = pathname?.startsWith('/settings');
  const backgroundColor = isSettingsPage
    ? settingsColors.pageBackground.tailwind
    : themeColors.mainBackground.tailwind;

  // 计算左边距：桌面端始终为sidebar留出空间
  // 根据展开状态设置相应边距
  const getLeftMargin = () => {
    return isExpanded ? 'left-0 md:left-64' : 'left-0 md:left-16';
  };

  return (
    <>
      {/* Header 主体 */}
      <header
        className={cn(
          'fixed top-0 right-4 z-20 h-12',
          getLeftMargin(),
          'transition-[left] duration-150 ease-in-out',
          backgroundColor,
          'flex items-center justify-between pr-2 pl-4'
        )}
      >
        <div className="flex items-center space-x-2">
          {/* Left side: current conversation title button, supports dynamic hiding strategy, only shows on history chat page */}
          <ConversationTitleButton />
        </div>

        <div className="flex items-center space-x-2">
          {/* Workflow history button (only shows on workflow and text generation pages) */}
          <WorkflowHistoryButton />

          {/* User avatar button */}
          <DesktopUserAvatar />
        </div>
      </header>
    </>
  );
}
