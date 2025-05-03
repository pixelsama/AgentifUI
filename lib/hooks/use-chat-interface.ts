import { useState } from 'react';
import { useChatInputStore } from '@lib/stores/chat-input-store';

interface Message {
  text: string;
  isUser: boolean;
}

export function useChatInterface() {
  const { isWelcomeScreen, setIsWelcomeScreen } = useChatInputStore();
  const [messages, setMessages] = useState<Message[]>([]);

  // 处理消息提交
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

  // 判断当前是否为欢迎界面
  const shouldShowWelcome = isWelcomeScreen && messages.length === 0;
  
  // 判断当前是否应该显示聊天加载器
  const shouldShowLoader = messages.length > 0;

  return {
    messages,
    handleSubmit,
    shouldShowWelcome,
    shouldShowLoader,
    isWelcomeScreen
  };
} 