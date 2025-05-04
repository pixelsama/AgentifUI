'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ChatInput } from '@components/chat-input';
import { ChatLoader, WelcomeScreen, ChatInputBackdrop, PromptContainer } from '@components/chat';
import { useChatInterface, useChatStateSync } from '@lib/hooks';
import { useChatStore } from '@lib/stores/chat-store';
import { useChatScroll } from '@lib/hooks/use-chat-scroll';

export default function ChatPage() {
  const params = useParams();
  const conversationIdFromUrl = params.conversationId as string | undefined;
  
  const setCurrentConversationId = useChatStore((state) => state.setCurrentConversationId);

  const { isDark, isWelcomeScreen } = useChatStateSync();
  
  const { 
    messages, 
    handleSubmit, 
    isProcessing,        
    handleStopProcessing, 
  } = useChatInterface();

  const scrollRef = useChatScroll<HTMLDivElement>(messages.length);

  const isWaitingForResponse = useChatStore((state) => state.isWaitingForResponse);

  useEffect(() => {
    const idToSet = (conversationIdFromUrl && conversationIdFromUrl !== 'new') ? conversationIdFromUrl : null;
    console.log(`[ChatPage Effect] Syncing URL param. conversationIdFromUrl: ${conversationIdFromUrl}, Setting store ID to: ${idToSet}`);
    setCurrentConversationId(idToSet);

    // --- BEGIN COMMENT ---
    // "new" 是一个特殊标识符，用于在 URL 中显式表示用户想要开始一个新对话。
    // 在 handleSubmit 中，当首次从 API 获取到真实的 conversationId 后，
    // URL 会被替换成 /chat/[realId]。
    // 未来如果实现"自动重命名对话"（例如根据第一条消息内容），
    // 可能也需要参考或处理这个初始的 "new" 状态。
    // --- END COMMENT ---
  }, [conversationIdFromUrl, setCurrentConversationId]);

  return (
    <div className={`h-full flex flex-col ${isDark ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}>
      <div className="relative h-full flex flex-col overflow-hidden">
        <div className="flex-1 overflow-hidden">
          {isWelcomeScreen && useChatStore.getState().currentConversationId === null ? (
            <WelcomeScreen />
          ) : (
            <div 
              ref={scrollRef}
              className="h-full overflow-y-auto scroll-smooth"
            >
              <ChatLoader 
                messages={messages} 
                isWaitingForResponse={isWaitingForResponse}
              />
            </div>
          )}
        </div>

        <ChatInputBackdrop />
        
        <ChatInput
          onSubmit={handleSubmit}
          placeholder="输入消息，按Enter发送..."
          isProcessing={isProcessing}
          isWaiting={isWaitingForResponse}
          onStop={handleStopProcessing}
        />
        
        {useChatStore.getState().currentConversationId === null && <PromptContainer />}
      </div>
    </div>
  );
} 