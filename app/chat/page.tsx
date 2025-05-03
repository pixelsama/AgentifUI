'use client';

import { ChatInput } from '@components/chat-input';
import { ChatLoader, WelcomeScreen, ChatInputBackdrop, PromptContainer } from '@components/chat';
import { useChatInterface, useChatStateSync } from '@lib/hooks';

export default function ChatPage() {
  // 使用单一hook同步应用状态到聊天输入状态
  const { isDark, isWelcomeScreen } = useChatStateSync();
  
  // 获取聊天逻辑
  const { messages, handleSubmit } = useChatInterface();

  return (
    <div className={`h-full flex flex-col ${isDark ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}>
      <div className="relative h-full flex flex-col overflow-hidden">
        {/* 消息区域 - 设置固定高度并限制在容器内滚动 */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto">
            {isWelcomeScreen && <WelcomeScreen />}
            {messages.length > 0 && <ChatLoader messages={messages} />}
          </div>
        </div>

        {/* 输入框背景 */}
        <ChatInputBackdrop />
        
        {/* 聊天输入框 */}
        <ChatInput
          onSubmit={handleSubmit}
          placeholder="输入消息，按Enter发送..."
        />
        
        {/* 提示容器 */}
        <PromptContainer />
      </div>
    </div>
  );
} 