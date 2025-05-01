"use client"

import * as React from "react"
import { MessageSquare, ChevronDown, ChevronUp } from "lucide-react"
import { SidebarButton } from "./sidebar-button"
import { SidebarChatIcon } from "./sidebar-chat-icon"
import { cn } from "@lib/utils"
import { useSidebarStore } from "@lib/stores/sidebar-store"

// 示例数据 - 使用新的图标组件
const chatHistory = [
  { id: 1, title: "网站开发指南", icon: <SidebarChatIcon size="sm" /> },
  { id: 2, title: "JavaScript最佳实践", icon: <SidebarChatIcon size="sm" /> },
  { id: 3, title: "React Hooks详解", icon: <SidebarChatIcon size="sm" /> },
  { id: 4, title: "Grid与Flexbox比较", icon: <SidebarChatIcon size="sm" /> },
  { id: 5, title: "TypeScript技巧", icon: <SidebarChatIcon size="sm" /> },
  { id: 6, title: "Next.js App Router", icon: <SidebarChatIcon size="sm" /> },
]

interface SidebarChatListProps {
  isDark: boolean
  contentVisible: boolean
}

export function SidebarChatList({ isDark, contentVisible }: SidebarChatListProps) {
  const { lockExpanded } = useSidebarStore()
  const [showAllChats, setShowAllChats] = React.useState(false)
  const visibleChats = showAllChats ? chatHistory : chatHistory.slice(0, 3)

  const toggleShowAllChats = () => {
    setShowAllChats(!showAllChats)
    lockExpanded() // Keep sidebar expanded when toggling
  }

  return (
    <div className="space-y-3 px-3">
      <div className={cn(
        "px-3 text-xs font-semibold flex items-center gap-2",
        isDark ? "text-blue-400" : "text-primary/90"
      )}>
        <MessageSquare className="h-3.5 w-3.5" />
        <span>对话列表</span>
      </div>
      <div className="space-y-1.5">
        {visibleChats.map((chat) => (
          <SidebarButton
            key={chat.id}
            icon={chat.icon}
            text={chat.title}
            active={chat.id === 1} // Example active state
            className="w-full group"
          />
        ))}
        {chatHistory.length > 3 && (
          <SidebarButton
            icon={showAllChats 
              ? <ChevronUp className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5" /> 
              : <ChevronDown className="h-4 w-4 transition-transform duration-200 group-hover:translate-y-0.5" />
            }
            text={showAllChats ? "收起" : "更多"}
            className={cn(
              "w-full text-xs group",
              isDark ? "text-gray-500" : "text-muted-foreground"
            )}
            onClick={toggleShowAllChats}
          />
        )}
      </div>
    </div>
  )
} 