"use client"

import React, { useEffect, useRef, useState } from "react"
import { cn } from "@lib/utils"
import { useTheme, useChatWidth, useChatBottomSpacing } from "@lib/hooks"
import { UserMessage, AssistantMessage } from "./messages"
import { ChatMessage } from '@lib/stores/chat-store';
import { TypingDots } from "@components/ui/typing-dots";
import { MessageSkeleton } from "./message-skeleton";
import { useChatScrollStore } from "@lib/stores/chat-scroll-store"

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
  
  // 消息容器底部引用，用于滚动到底部
  const messagesEndRef = useRef<HTMLDivElement>(null)
  // 上一次消息数量引用，用于检测新消息
  const prevMessagesCountRef = useRef<number>(0)
  // 初始加载标记
  const initialLoadCompletedRef = useRef<boolean>(false)
  
  // 使用chatScrollStore的滚动方法
  const scrollToBottom = useChatScrollStore(state => state.scrollToBottom);
  const resetScrollState = useChatScrollStore(state => state.resetScrollState);
  
  // 初始加载完成时
  useEffect(() => {
    if (!isLoadingInitial && messages.length > 0 && !initialLoadCompletedRef.current) {
      // 标记初始加载已完成
      initialLoadCompletedRef.current = true
      
      // 简化滚动逻辑，只重置滚动状态，让主页面的滚动系统处理实际滚动
      resetScrollState();
    }
  }, [isLoadingInitial, messages.length, resetScrollState])
  
  // 当消息数量变化时
  useEffect(() => {
    // 当有新消息时，滚动到底部
    if (messages.length > prevMessagesCountRef.current && initialLoadCompletedRef.current) {
      // 使用 store 的滚动方法，让主页面的滚动容器处理
      scrollToBottom('smooth');
    }
    
    // 更新消息数量引用
    prevMessagesCountRef.current = messages.length
  }, [messages.length, scrollToBottom])
  
  return (
    <div
      className={cn(
        "w-full mx-auto",
        widthClass, paddingClass,
        className
      )}
    >
      <div 
        className="pt-4 space-y-4"
        style={paddingBottomStyle}
      >
        {isLoadingInitial ? (
          // 显示骨架屏
          <MessageSkeleton />
        ) : (
          <>
            {messages.map((msg) => (
              msg.isUser ? (
                <UserMessage 
                  key={msg.id} 
                  content={msg.text} 
                  attachments={msg.attachments} 
                  id={msg.id}
                />
              ) : (
                <AssistantMessage 
                  key={msg.id} 
                  content={msg.text} 
                  isStreaming={msg.isStreaming ?? false}
                  wasManuallyStopped={msg.wasManuallyStopped ?? false}
                  id={msg.id}
                />
              )
            ))}

            {isWaitingForResponse && (
              <div className="flex justify-start py-2 my-2">
                <TypingDots size="lg" />
              </div>
            )}
          </>
        )}
        
        {/* 这个div用于滚动定位，始终保持在消息列表底部 */}
        <div ref={messagesEndRef} className="h-0" />
      </div>
    </div>
  )
}

// TODO: 后续扩展功能
// 1. 支持富文本消息
// 2. 添加消息时间戳
// 3. 支持消息状态（发送中、已送达、已读）
// 4. 支持消息反馈（点赞、复制等操作）
// 5. 支持图片、文件等多媒体消息 