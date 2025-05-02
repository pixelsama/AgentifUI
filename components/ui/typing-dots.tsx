"use client"

import React from "react"
import { cn } from "@lib/utils"
import { useTheme } from "@lib/hooks/use-theme"

interface TypingDotsProps {
  className?: string
}

export function TypingDots({ className }: TypingDotsProps) {
  const { isDark } = useTheme()
  
  return (
    <div className={cn("flex items-center space-x-1", className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            isDark ? "bg-gray-400" : "bg-gray-700",
            "animate-pulse",
            {
              "animation-delay-0": i === 0,
              "animation-delay-200": i === 1,
              "animation-delay-400": i === 2,
            }
          )}
          style={{
            animationDelay: `${i * 200}ms`
          }}
        />
      ))}
    </div>
  )
}

// 添加全局CSS (需在app/globals.css中添加)
// @keyframes pulse {
//   0%, 100% {
//     opacity: 0.5;
//     transform: scale(0.8);
//   }
//   50% {
//     opacity: 1;
//     transform: scale(1);
//   }
// }
// 
// .animate-pulse {
//   animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
// }
// 
// .animation-delay-0 {
//   animation-delay: 0ms;
// }
// 
// .animation-delay-200 {
//   animation-delay: 200ms;
// }
// 
// .animation-delay-400 {
//   animation-delay: 400ms;
// } 