'use client';

import { useState } from 'react';
import { ChatInput } from '@components/chat-input';
import { ChatLoader, WelcomeScreen } from '@components/chat';
import { useChatStore } from '@lib/stores/chat-input-store';
import { useTheme, useMobile } from '@lib/hooks';

export default function ChatPage() {
  const { isWelcomeScreen, setIsWelcomeScreen } = useChatStore();
  const { isDark } = useTheme();
  const isMobile = useMobile();
  const [messages, setMessages] = useState<{ text: string; isUser: boolean }[]>([]);

  const handleSubmit = (message: string) => {
    // 添加用户消息
    setMessages((prev) => [...prev, { text: message, isUser: true }]);

    // 如果是欢迎界面，切换到聊天界面
    if (isWelcomeScreen) {
      setIsWelcomeScreen(false);
    }

    // 模拟AI回复
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          text: `你发送了: "${message}"`,
          isUser: false,
        },
      ]);
    }, 1000);
  };

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}>
      <main className={`flex-1 relative overflow-hidden ${isMobile ? 'px-2' : 'px-4'}`}>
        {/* 聊天内容区域 - 欢迎界面或消息列表 */}
        {isWelcomeScreen && messages.length === 0 ? (
          <WelcomeScreen />
        ) : (
          <ChatLoader messages={messages} />
        )}

        {/* 聊天输入组件 */}
        <ChatInput
          isWelcomeScreen={isWelcomeScreen && messages.length === 0}
          onSubmit={handleSubmit}
          isDark={isDark}
          placeholder="输入消息，按Enter发送..."
          className={`w-full max-w-full ${isMobile ? 'md:max-w-full' : 'md:max-w-3xl lg:max-w-4xl'}`}
        />
      </main>
    </div>
  );
} 