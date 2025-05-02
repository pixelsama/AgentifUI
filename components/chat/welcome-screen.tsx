"use client"

import React from "react"
import { cn } from "@lib/utils"
import { useTheme } from "@lib/hooks"

interface WelcomeScreenProps {
  className?: string
}

export const WelcomeScreen = ({ className }: WelcomeScreenProps) => {
  const { isDark } = useTheme()
  
  return (
    <div className={cn("flex flex-col items-center h-full", className)}>
      <div className="text-center max-w-md px-4 mt-[30vh]">
        <h2 className="text-2xl font-bold mb-2">欢迎使用聊天功能</h2>
        <p className={`${isDark ? "text-gray-400" : "text-gray-500"}`}>
          在下方输入框中输入消息开始聊天
        </p>
      </div>
    </div>
  )
} 