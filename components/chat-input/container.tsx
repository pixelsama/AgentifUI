import type React from "react"
import { cn } from "@lib/utils"

interface ChatContainerProps {
  children: React.ReactNode
  isWelcomeScreen?: boolean
  isDark?: boolean
  className?: string
}

export const ChatContainer = ({ children, isWelcomeScreen = false, isDark = false, className }: ChatContainerProps) => {
  return (
    <div
      className={cn(
        "w-full mx-auto px-4",
        // 使用相对定位而不是固定定位，确保跟随主内容区
        isWelcomeScreen
          ? "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          : "relative bottom-6 left-0 right-0 mb-6",
        className,
      )}
    >
      <div
        className={cn(
          "flex flex-col rounded-2xl",
          isDark ? "bg-gray-800" : "bg-white",
          "shadow-[0_0_15px_rgba(0,0,0,0.1)]",
        )}
      >
        {children}
      </div>
    </div>
  )
}
