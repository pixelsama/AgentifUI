"use client"

import { Sidebar } from "@components/sidebar"
import { cn } from "@lib/utils"
import { useSidebarStore } from "@lib/stores/sidebar-store"
import { useThemeStore } from "@lib/stores/theme-store"
import { useEffect } from "react"
import { useIsMobile } from "../../hooks/use-mobile"

interface ChatLayoutProps {
  children: React.ReactNode
}

export default function ChatLayout({ children }: ChatLayoutProps) {
  const { isExpanded } = useSidebarStore()
  const { theme } = useThemeStore()
  const isMobile = useIsMobile()
  
  // 在客户端应用主题
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark")
  }, [theme])

  return (
    <div className="flex min-h-screen overflow-hidden bg-background">
      <Sidebar />
      <main
        className={cn(
          "flex-1 overflow-auto",
          // 使用自定义CSS类控制过渡效果
          "main-transition",
          isExpanded ? "main-expanded" : "main-collapsed",
          // Responsive layout
          "w-full md:w-auto",
          isExpanded ? "md:ml-64" : "md:ml-16",
          // On mobile, always take full width and push from left
          "ml-16",
        )}
      >
        <div className="p-4 md:p-6">{children}</div>
      </main>
    </div>
  )
} 