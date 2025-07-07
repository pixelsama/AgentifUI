'use client';

import { useMobile } from '@lib/hooks';
import { useTheme } from '@lib/hooks/use-theme';
import { useChatInputStore } from '@lib/stores/chat-input-store';
import { useChatStore } from '@lib/stores/chat-store';
import { useSidebarStore } from '@lib/stores/sidebar-store';
import { cn } from '@lib/utils';

import * as React from 'react';

import { useRouter } from 'next/navigation';

import { SidebarChatList } from './sidebar-chat-list';
import { SidebarFavoriteApps } from './sidebar-favorite-apps';

/**
 * 侧边栏内容组件
 *
 * 管理侧边栏主要内容区域，包含常用应用和聊天列表
 * 提供选中状态管理，并负责将状态传递给子组件
 */
export function SidebarContent() {
  const {
    isExpanded,
    selectedType,
    selectedId,
    selectItem,
    contentVisible,
    updateContentVisibility,
    showContent,
  } = useSidebarStore();
  const { isDark } = useTheme();
  const isMobile = useMobile();
  const router = useRouter();

  // 获取聊天相关状态和方法
  const setCurrentConversationId = useChatStore(
    state => state.setCurrentConversationId
  );
  const { setIsWelcomeScreen } = useChatInputStore();

  // 处理侧边栏展开/收起的内容显示逻辑
  React.useEffect(() => {
    // 首先通知store更新内容可见性的基本状态
    updateContentVisibility(isMobile);

    // 只为桌面端添加延迟显示
    if (isExpanded && !isMobile) {
      const timer = setTimeout(() => {
        showContent();
      }, 20); // 桌面端保留延迟动画
      return () => clearTimeout(timer);
    }
    // 🎯 移除 store 方法的依赖，避免路由切换时的重新执行和闪烁
    // zustand store 方法在路由切换时可能改变引用，导致不必要的重新渲染
  }, [isExpanded, isMobile]);

  /**
   * 选择聊天项目的回调函数
   * @param chatId 聊天项目的ID
   */
  const handleSelectChat = React.useCallback(
    async (chatId: number | string) => {
      const chatIdStr = String(chatId);

      try {
        console.log('[ChatList] 开始切换到对话:', chatIdStr);

        // 1. 更新侧边栏选中状态 - 保持当前展开状态
        selectItem('chat', chatId, true);
        // 2. 不再调用 lockExpanded，由用户自行控制锁定

        // 3. 设置当前对话ID
        setCurrentConversationId(chatIdStr);
        // 4. 关闭欢迎屏幕
        setIsWelcomeScreen(false);
        // 5. 路由跳转到对话页面
        router.push(`/chat/${chatId}`);

        console.log('[ChatList] 路由跳转已发起:', `/chat/${chatId}`);
      } catch (error) {
        console.error('[ChatList] 切换对话失败:', error);
      }
    },
    [selectItem, setCurrentConversationId, setIsWelcomeScreen, router]
  );

  return (
    <div className="relative flex-1 overflow-hidden">
      {/* Removed top divider: no horizontal line separation in dark mode */}

      {/* Scrollable Content Area */}
      <div
        className={cn(
          'absolute inset-0 flex flex-col overflow-y-auto pb-4',
          'scrollbar-thin scrollbar-track-transparent',
          isDark ? 'scrollbar-thumb-gray-600' : 'scrollbar-thumb-accent',
          // 在移动端上不应用动画效果，直接显示
          !isMobile &&
            isExpanded &&
            'transition-[opacity,transform] duration-150 ease-in-out',
          // 控制可见性和动画状态
          isExpanded
            ? contentVisible
              ? // 移动端上不应用动画，直接显示
                'transform-none opacity-100'
              : // 桌面端上保留动画效果
                !isMobile
                ? 'pointer-events-none -translate-x-4 scale-95 opacity-0'
                : 'transform-none opacity-100'
            : 'hidden' // 折叠时直接隐藏
        )}
      >
        {/* Favorite apps area: directly placed without extra wrapping, supports sticky scrolling */}
        <SidebarFavoriteApps
          isDark={isDark ?? false}
          contentVisible={contentVisible}
        />

        {/* Chat list area: adds top spacing, separated from favorite apps */}
        <div className="mt-4 min-h-0 flex-1">
          <SidebarChatList
            isDark={isDark ?? false}
            contentVisible={contentVisible}
            selectedId={selectedType === 'chat' ? String(selectedId) : null}
            onSelectChat={handleSelectChat}
          />
        </div>
      </div>

      {/* Removed bottom divider: no horizontal line separation in dark mode */}
    </div>
  );
}
