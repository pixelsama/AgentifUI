'use client';

import {
  ChatInputBackdrop,
  ChatLoader,
  MessagesLoadingIndicator,
  PageLoadingSpinner,
  ScrollToBottomButton,
  WelcomeScreen,
} from '@components/chat';
import { ChatInput } from '@components/chat-input';
import { DynamicSuggestedQuestions } from '@components/chat/dynamic-suggested-questions';
// 🎯 新增：Chatflow 相关导入
import { ChatflowFloatingController } from '@components/chatflow/chatflow-floating-controller';
import { ChatflowNodeTracker } from '@components/chatflow/chatflow-node-tracker';
import { FilePreviewCanvas } from '@components/file-preview/file-preview-canvas';
// NavBar 已移至根布局，无需导入
import { useChatInterface, useChatStateSync } from '@lib/hooks';
import { useMobile } from '@lib/hooks';
import { useChatPageState } from '@lib/hooks/use-chat-page-state';
import { useChatScroll } from '@lib/hooks/use-chat-scroll';
import { useChatflowDetection } from '@lib/hooks/use-chatflow-detection';
import { useChatflowState } from '@lib/hooks/use-chatflow-state';
import { useConversationMessages } from '@lib/hooks/use-conversation-messages';
import { useProfile } from '@lib/hooks/use-profile';
import { useThemeColors } from '@lib/hooks/use-theme-colors';
import { useChatLayoutStore } from '@lib/stores/chat-layout-store';
import { useChatStore } from '@lib/stores/chat-store';
import { useChatTransitionStore } from '@lib/stores/chat-transition-store';
import { useChatflowExecutionStore } from '@lib/stores/chatflow-execution-store';
import { useSidebarStore } from '@lib/stores/sidebar-store';
import { useFilePreviewStore } from '@lib/stores/ui/file-preview-store';
import { cn } from '@lib/utils';

import React from 'react';
import { useEffect, useLayoutEffect, useState } from 'react';

import { useTranslations } from 'next-intl';
import { useParams, usePathname } from 'next/navigation';

export default function ChatPage() {
  const params = useParams<{ conversationId: string }>();
  const conversationIdFromUrl = params.conversationId;
  const pathname = usePathname();
  const t = useTranslations('pages.chat.input');

  // 获取sidebar状态和mobile状态，用于计算backdrop边距
  const { isExpanded } = useSidebarStore();
  const isMobile = useMobile();

  // 🎯 获取chatflow执行状态清理方法
  const { resetExecution } = useChatflowExecutionStore();

  // 使用 useChatPageState hook 管理聊天页面状态
  // 这样可以减少页面组件中的状态管理逻辑
  const {
    isWelcomeScreen,
    isSubmitting,
    isTransitioningToWelcome,
    wrapHandleSubmit,
  } = useChatPageState(conversationIdFromUrl);

  const { inputHeight } = useChatLayoutStore();
  const isPreviewOpen = useFilePreviewStore(state => state.isPreviewOpen);
  const { colors, isDark } = useThemeColors();

  // 🎯 使用封装的Hook检测chatflow应用
  const { isChatflowApp } = useChatflowDetection();

  // 🎯 使用封装的Hook管理chatflow状态
  const {
    messages,
    handleSubmit: originalHandleSubmit,
    isProcessing,
    handleStopProcessing,
    sendDirectMessage,
    nodeTracker,
    showNodeTracker,
    setShowNodeTracker,
    showFloatingController,
  } = useChatflowState(isChatflowApp);

  // 🎯 关键修复：路由切换时清理chatflow执行状态
  // 确保切换到历史对话时不会显示之前的节点数据
  useLayoutEffect(() => {
    if (
      pathname?.startsWith('/chat/') &&
      conversationIdFromUrl &&
      conversationIdFromUrl !== 'new' &&
      !conversationIdFromUrl.includes('temp-')
    ) {
      console.log('[ChatPage] 路由切换到历史对话，清理chatflow执行状态');

      // 清理chatflow执行状态，确保不会显示之前的节点数据
      resetExecution();

      console.log('[ChatPage] chatflow执行状态清理完成');
    }
  }, [pathname, conversationIdFromUrl, resetExecution]);

  // 使用分页加载钩子获取历史消息
  const {
    loading,
    hasMoreMessages,
    isLoadingMore,
    loadMoreMessages,
    setMessagesContainer,
    error,
    isLoadingInitial,
  } = useConversationMessages();

  // 使用 wrapHandleSubmit 包装原始的 handleSubmit 函数
  const handleSubmit = wrapHandleSubmit(originalHandleSubmit);

  const scrollRef = useChatScroll(messages);

  const isWaitingForResponse = useChatStore(
    state => state.isWaitingForResponse
  );

  const chatInputHeightVar = `${inputHeight || 80}px`;

  // 合并scrollRef和setMessagesContainer
  // scrollRef是RefObject类型，直接设置current属性
  const setScrollRef = (element: HTMLDivElement | null) => {
    if (scrollRef) {
      scrollRef.current = element;
    }
    setMessagesContainer(element);
  };

  // 只在 /chat/new 路由下调用 useProfile，其他路由不需要
  // 使用缓存机制，避免loading状态和闪烁
  const isNewChat = conversationIdFromUrl === 'new';
  const { profile, isLoading: isProfileLoading } = isNewChat
    ? useProfile()
    : { profile: null, isLoading: false };

  return (
    <div
      className={cn(
        'relative flex h-full w-full flex-col',
        colors.mainBackground.tailwind,
        colors.mainText.tailwind
      )}
    >
      {/* 🎯 NavBar 已移至根布局，无需重复渲染 */}
      <div
        className={cn(
          'relative flex min-h-0 flex-1 flex-col overflow-hidden',
          'pt-10',
          'transition-[width] duration-300 ease-in-out',
          isPreviewOpen ? 'w-[50%] lg:w-[60%]' : 'w-full'
        )}
        style={
          { '--chat-input-height': chatInputHeightVar } as React.CSSProperties
        }
      >
        {/* --- BEGIN COMMENT ---
        页面级 loading，使用 PageLoadingSpinner 组件确保全屏覆盖
        只在 /chat/new 路由下显示 loading 状态
        只有在profile还在初始加载时才显示页面级loading
        --- END COMMENT --- */}
        <PageLoadingSpinner isLoading={isNewChat && isProfileLoading} />

        {/* 主要内容 */}
        <div className="min-h-0 flex-1">
          {/* --- BEGIN COMMENT ---
          显示欢迎屏幕的条件：
          1. 新聊天页面且没有消息
          2. 或者欢迎状态且没有消息且不在提交中
          --- END COMMENT --- */}
          {/*暂时使用全名来替代username（昵称），因为username可能为空*/}
          {isNewChat && messages.length === 0 ? (
            <WelcomeScreen username={profile?.username} />
          ) : messages.length === 0 && !isSubmitting && isWelcomeScreen ? (
            <WelcomeScreen username={profile?.username} />
          ) : (
            <div
              ref={setScrollRef}
              className="chat-scroll-container h-full overflow-y-auto scroll-smooth"
            >
              {/* --- BEGIN COMMENT ---
              显示"加载更多"按钮或加载指示器的条件：
              1. 非初始加载状态(避免与初始骨架屏重叠)
              2. 非新对话或临时对话路径
              3. 确实有更多消息可加载
              4. 已经有消息显示（非空消息列表）
              5. 不在加载更多的状态中（避免闪烁）
              --- END COMMENT --- */}
              {!isLoadingInitial &&
                hasMoreMessages &&
                messages.length > 0 &&
                !isLoadingMore &&
                conversationIdFromUrl &&
                conversationIdFromUrl !== 'new' &&
                !conversationIdFromUrl.includes('temp-') && (
                  <MessagesLoadingIndicator
                    loadingState={loading.state}
                    isLoadingMore={isLoadingMore}
                    hasMoreMessages={hasMoreMessages}
                    error={error}
                    onRetry={loadMoreMessages}
                  />
                )}

              <ChatLoader
                messages={messages}
                isWaitingForResponse={isWaitingForResponse}
                isLoadingInitial={isLoadingInitial}
              />

              {/* --- BEGIN COMMENT ---
              🎯 新增：Chatflow 节点跟踪器 - 仅在chatflow应用时显示
              弹窗由用户主动点击悬浮球控制，或发送消息时自动弹出
              --- END COMMENT --- */}
              {isChatflowApp && showNodeTracker && (
                <ChatflowNodeTracker
                  isVisible={showNodeTracker}
                  className={cn(
                    'fixed right-4 bottom-40 z-30 max-w-sm',
                    'transition-all duration-300'
                  )}
                />
              )}
            </div>
          )}
        </div>

        <ScrollToBottomButton />

        {/* --- BEGIN COMMENT ---
        🎯 新增：Chatflow 悬浮控制器 - 仅在chatflow应用时显示
        --- END COMMENT --- */}
        {isChatflowApp && (
          <ChatflowFloatingController
            isVisible={showFloatingController}
            isTrackerVisible={showNodeTracker}
            onToggleTracker={() => setShowNodeTracker(!showNodeTracker)}
            onClose={() => {
              // 悬浮球不能关闭，因为它是chatflow应用的核心功能
              // 如果需要隐藏，可以关闭跟踪器
              setShowNodeTracker(false);
            }}
          />
        )}

        <ChatInputBackdrop />

        <ChatInput
          onSubmit={handleSubmit}
          placeholder={t('placeholder')}
          isProcessing={isProcessing}
          isWaiting={isWaitingForResponse}
          onStop={handleStopProcessing}
          isWelcomeScreen={isWelcomeScreen}
          isTransitioningToWelcome={isTransitioningToWelcome}
          showModelSelector={isNewChat && messages.length === 0}
        />

        {/* --- BEGIN COMMENT ---
        显示动态推荐问题的条件：
        1. 新聊天页面且没有消息
        2. 或者欢迎状态且没有消息且不在提交中
        --- END COMMENT --- */}
        {isNewChat && messages.length === 0 && (
          <DynamicSuggestedQuestions onQuestionClick={sendDirectMessage} />
        )}
        {!isSubmitting &&
          isWelcomeScreen &&
          messages.length === 0 &&
          conversationIdFromUrl !== 'new' && (
            <DynamicSuggestedQuestions onQuestionClick={sendDirectMessage} />
          )}
      </div>

      <FilePreviewCanvas />
    </div>
  );
}
