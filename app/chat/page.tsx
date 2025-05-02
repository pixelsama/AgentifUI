'use client';

import { ChatInput } from '@components/chat-input';
import { ChatLoader, WelcomeScreen, ChatInputBackdrop } from '@components/chat';
import { useTheme, useMobile, useChatInterface } from '@lib/hooks';

export default function ChatPage() {
  const { isDark } = useTheme();
  const isMobile = useMobile();
  const { 
    messages, 
    handleSubmit, 
    shouldShowWelcome, 
    shouldShowLoader,
    isWelcomeScreen
  } = useChatInterface();

  return (
    <div className={`h-full flex flex-col ${isDark ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}>
      {/* 包装容器使用relative定位提供定位上下文，并且保持100%高度 */}
      <div className="relative h-full flex flex-col">
        {/* 消息区域可滚动且占据剩余空间 */}
        <div className="flex-1 overflow-auto">
          {/* 欢迎界面 */}
          {shouldShowWelcome && <WelcomeScreen />}
          
          {/* 聊天消息区域 */}
          {shouldShowLoader && <ChatLoader messages={messages} />}
        </div>

        {/* 底部背景层 - 先放置backdrop确保它在消息上但在输入框下 */}
        <ChatInputBackdrop />
        
        {/* ChatInput将相对于此容器定位，而不是视口 */}
        <ChatInput
          isWelcomeScreen={isWelcomeScreen && messages.length === 0}
          onSubmit={handleSubmit}
          isDark={isDark}
          placeholder="输入消息，按Enter发送..."
        />
      </div>
    </div>
  );
} 