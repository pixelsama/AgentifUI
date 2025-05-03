"use client"

import React from "react"
import { cn } from "@lib/utils"
import { useTheme, useChatWidth, useChatBottomSpacing } from "@lib/hooks"
import { UserMessage, AssistantMessage } from "./messages"

interface Message {
  text: string
  isUser: boolean
}

interface ChatLoaderProps {
  messages: Message[]
  isWelcomeScreen?: boolean
  className?: string
}

export const ChatLoader = ({ messages, isWelcomeScreen = false, className }: ChatLoaderProps) => {
  const { isDark } = useTheme()
  const { widthClass, paddingClass } = useChatWidth()
  const { paddingBottomStyle } = useChatBottomSpacing()
  
  // 如果是欢迎界面或没有消息，不渲染
  if (isWelcomeScreen || messages.length === 0) return null

  return (
    <div
      className={cn(
        "w-full mx-auto h-full",
        widthClass, paddingClass,
        className
      )}
    >
      <div 
        className="pt-4 space-y-4"
        style={paddingBottomStyle} // 使用动态计算的内联样式
      >
        {messages.map((msg, index) => (
          msg.isUser ? (
            <UserMessage 
              key={index} 
              content={msg.text} 
            />
          ) : (
            <AssistantMessage 
              key={index} 
              content={msg.text} 
            />
          )
        ))}
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