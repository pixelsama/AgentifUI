'use client';

import { useThemeColors } from '@lib/hooks/use-theme-colors';
import { useChatScrollStore } from '@lib/stores/chat-scroll-store';
import { cn } from '@lib/utils';
import { ChevronDown } from 'lucide-react';

import React from 'react';

import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';

// ScrollToBottomButton 组件
// 简化渲染逻辑：只在 /chat 路径下（非 /chat/new）且不在底部时显示
export const ScrollToBottomButton = () => {
  const { isAtBottom } = useChatScrollStore();
  const { colors, isDark } = useThemeColors();
  const resetScrollState = useChatScrollStore(state => state.resetScrollState);
  const pathname = usePathname();
  const t = useTranslations('pages.chat.input');

  // 🎯 简化的渲染条件：
  // 1. 在 /chat 路径下（但不是 /chat/new）
  // 2. 不在底部
  const isInChatPage = pathname.startsWith('/chat') && pathname !== '/chat/new';
  const shouldRender = isInChatPage && !isAtBottom;

  // 动态计算 bottom 偏移量
  // 基于输入框高度（CSS 变量 --chat-input-height）
  const bottomOffset = `calc(var(--chat-input-height, 80px) + 5.5rem)`;

  const handleClick = () => {
    // 重置滚动状态并滚动到底部
    resetScrollState();
  };

  if (!shouldRender) {
    return null;
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        // 定位与层级
        'absolute bottom-0 left-1/2 z-10 mb-4 -translate-x-1/2',

        // Base styles - 简化的样式
        'cursor-pointer rounded-full p-1.5 shadow-md transition-transform duration-150 ease-in-out',

        // 颜色主题
        colors.userMessageBackground.tailwind,
        colors.buttonHover.tailwind,
        isDark ? 'text-stone-300' : 'text-stone-700',

        // 交互效果
        'hover:scale-110 active:scale-95'
      )}
      style={{
        bottom: bottomOffset,
      }}
      aria-label={t('scrollToBottom')}
    >
      <ChevronDown className="h-4 w-4" />
    </button>
  );
};
