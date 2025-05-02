"use client"

import React from "react"
import { cn } from "@lib/utils"

interface WelcomeScreenProps {
  isDarkMode: boolean
  className?: string
}

export const WelcomeScreen = ({ isDarkMode, className }: WelcomeScreenProps) => {
  return (
    <div className={cn("h-full flex items-center justify-center", className)}>
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold">欢迎使用聊天功能</h2>
        <p className={`${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
          在下方输入框中输入消息开始聊天
        </p>
      </div>
    </div>
  )
} 