'use client';

import { ChatInput } from '@components/chat-input';
import { ChatLoader, WelcomeScreen } from '@components/chat';
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
    <div className={`min-h-screen flex flex-col ${isDark ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}>
      <main className={`flex-1 relative overflow-hidden ${isMobile ? 'px-2' : 'px-4'}`}>
        {/* 欢迎界面 */}
        {shouldShowWelcome && <WelcomeScreen />}
        
        {/* 聊天消息区域 */}
        {shouldShowLoader && <ChatLoader messages={messages} />}

        {/* 聊天输入组件 */}
        <ChatInput
          isWelcomeScreen={isWelcomeScreen && messages.length === 0}
          onSubmit={handleSubmit}
          isDark={isDark}
          placeholder="输入消息，按Enter发送..."
          className={`w-full ${isMobile ? 'max-w-full' : 'max-w-2xl mx-auto'}`}
        />
      </main>
    </div>
  );
} 