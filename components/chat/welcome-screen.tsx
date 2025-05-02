"use client"

import React from "react"
import { cn } from "@lib/utils"
import { useTheme } from "@lib/hooks"
import { useChatLayoutStore, INITIAL_INPUT_HEIGHT } from "@lib/stores/chat-layout-store"

interface WelcomeScreenProps {
  className?: string
}

export const WelcomeScreen = ({ className }: WelcomeScreenProps) => {
  const { isDark } = useTheme()
  const { inputHeight } = useChatLayoutStore()
  
  // Calculate HALF the offset needed based on input height increase
  const offsetY = Math.max(0, (inputHeight - INITIAL_INPUT_HEIGHT) / 2)

  return (
    <div 
      className={cn("flex flex-col items-center h-full transition-transform duration-200 ease-in-out", className)}
      // Apply negative translation (half the increase) to move it up
      style={{ transform: `translateY(-${offsetY}px)` }}
    >
      <div className="text-center max-w-md px-4 mt-[30vh]">
        <h2 className="text-2xl font-bold mb-2">你好，企业用户</h2>
        <p className={`${isDark ? "text-gray-400" : "text-gray-500"}`}>
          在下方输入框中输入消息开始聊天
        </p>
      </div>
    </div>
  )
} 