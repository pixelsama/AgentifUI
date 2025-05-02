"use client"

import React from "react"
import { cn } from "@lib/utils"
import { useTheme, useChatWidth } from "@lib/hooks"

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
  
  // 如果是欢迎界面或没有消息，不渲染
  if (isWelcomeScreen || messages.length === 0) return null

  return (
    <div
      className={cn(
        "w-full mx-auto",
        `${widthClass} ${paddingClass}`,
        "overflow-y-auto pb-32",
        className
      )}
    >
      <div className="pt-4 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.isUser ? "justify-end" : "justify-start"} mb-4`}>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                msg.isUser
                  ? isDark
                    ? "bg-blue-600 text-white"
                    : "bg-blue-500 text-white"
                  : isDark
                    ? "bg-gray-800 text-white border border-gray-700"
                    : "bg-white text-gray-900 shadow-md"
              }`}
            >
              {msg.text}
            </div>
          </div>
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