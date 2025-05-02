"use client"

import React from "react"
import { cn } from "@lib/utils"
import { useTheme } from "@lib/hooks"

interface WelcomeScreenProps {
  isDark?: boolean // 保留兼容性，但实际使用hooks
  className?: string
}

export const WelcomeScreen = ({ className }: WelcomeScreenProps) => {
  const { isDark } = useTheme()
  
  return (
    <div className={cn("h-full flex items-center justify-center", className)}>
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold">欢迎使用聊天功能</h2>
        <p className={`${isDark ? "text-gray-400" : "text-gray-500"}`}>
          在下方输入框中输入消息开始聊天
        </p>
      </div>
    </div>
  )
} 