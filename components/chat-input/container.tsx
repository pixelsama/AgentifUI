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
        "w-full max-w-2xl mx-auto px-4",
        // 欢迎界面保持居中，非欢迎界面使用absolute定位固定在容器底部
        isWelcomeScreen
          ? "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          : "absolute bottom-4 left-0 right-0", // 使用absolute而不是fixed，确保相对于父容器定位
        "z-20", // 添加较高的z-index确保在backdrop之上
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
