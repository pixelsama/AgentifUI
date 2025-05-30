import React from 'react'
import { ChatMessage } from '@lib/stores/chat-store'
import { UserMessage } from './user-message/user-message'
import { AssistantMessage } from './assistant-message/assistant-message'

interface MessageRendererProps {
  message: ChatMessage
  isDark?: boolean
}

// --- BEGIN COMMENT ---
// MessageRenderer组件
// 根据消息类型统一渲染用户消息或助手消息
// 简化了ChatLoader的渲染逻辑
// --- END COMMENT ---
export const MessageRenderer: React.FC<MessageRendererProps> = ({ 
  message, 
  isDark 
}) => {
  if (message.isUser) {
    return (
      <UserMessage 
        key={message.id} 
        content={message.text} 
        attachments={message.attachments} 
        id={message.id}
      />
    )
  } else {
    return (
      <AssistantMessage 
        key={message.id} 
        content={message.text} 
        isStreaming={message.isStreaming ?? false}
        wasManuallyStopped={message.wasManuallyStopped ?? false}
        id={message.id}
      />
    )
  }
} 