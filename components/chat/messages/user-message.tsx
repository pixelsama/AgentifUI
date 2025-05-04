"use client"

import React from "react"
import { cn } from "@lib/utils"
import { useTheme } from "@lib/hooks"

interface UserMessageProps {
  content: string
  className?: string
}

export const UserMessage: React.FC<UserMessageProps> = ({ content, className }) => {
  const { isDark } = useTheme()
  
  return (
    <div className="flex justify-end mb-8">
      <div
        className={cn(
          "max-w-[60%] rounded-2xl px-4 py-2",
          isDark 
            ? "bg-blue-600 text-white" 
            : "bg-blue-500 text-white",
          className
        )}
      >
        {content}
      </div>
    </div>
  )
} 