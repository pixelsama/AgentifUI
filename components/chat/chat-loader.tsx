"use client"

import React, { useRef, useEffect } from 'react'
import { cn } from '@lib/utils'
import { useTheme } from '@lib/hooks/use-theme'
import { useChatWidth } from '@lib/hooks/use-chat-width'
import { useChatBottomSpacing } from '@lib/hooks/use-chat-bottom-spacing'
import { useChatScrollStore } from '@lib/stores/chat-scroll-store'
import { ChatMessage } from '@lib/stores/chat-store'
import { MessageRenderer } from './messages/message-renderer'

interface ChatLoaderProps {
  messages: ChatMessage[]
  isWaitingForResponse?: boolean
  isLoadingInitial?: boolean
  className?: string
}

export const ChatLoader = ({ 
  messages, 
  isWaitingForResponse = false, 
  isLoadingInitial = false,
  className 
}: ChatLoaderProps) => {
  const { isDark } = useTheme()
  const { widthClass, paddingClass } = useChatWidth()
  const { paddingBottomStyle } = useChatBottomSpacing()
  
  // 消息容器底部引用，用于滚动检测
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // 使用新的滚动管理系统
  const { forceScrollToBottom } = useChatScrollStore();
  
  // 初始加载完成时强制滚动到底部
  useEffect(() => {
    if (!isLoadingInitial && messages.length > 0) {
      forceScrollToBottom('auto');
    }
  }, [isLoadingInitial, messages.length, forceScrollToBottom])

  return (
    <div 
      className={cn(
        "w-full mx-auto",
        widthClass,
        paddingClass,
        className
      )}
      style={paddingBottomStyle}
    >
      <div className="space-y-4">
        {messages.map((message) => (
          <MessageRenderer
            key={message.id}
            message={message}
            isDark={isDark}
          />
        ))}
        
        {isWaitingForResponse && (
          <div className={cn(
            "flex items-center space-x-2 py-4",
            isDark ? "text-gray-400" : "text-gray-600"
          )}>
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>
      
      <div ref={messagesEndRef} className="h-1" />
    </div>
  )
}

// TODO: 后续扩展功能
// 1. 支持富文本消息
// 2. 添加消息时间戳
// 3. 支持消息状态（发送中、已送达、已读）
// 4. 支持消息反馈（点赞、复制等操作）
// 5. 支持图片、文件等多媒体消息 