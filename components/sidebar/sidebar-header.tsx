"use client"
import { Plus } from "lucide-react"
import { SidebarButton } from "./sidebar-button"
import { useSidebarStore } from "@lib/stores/sidebar-store"
import { cn } from "@lib/utils"
import { SidebarChatIcon } from "./sidebar-chat-icon"
import { useTheme } from "@lib/hooks/use-theme"

export function SidebarHeader() {
  const { isExpanded, toggleSidebar } = useSidebarStore()
  const { isDark } = useTheme()

  return (
    <div className={cn(
      "flex flex-col gap-2 py-4 px-3",
    )}>
      <SidebarButton
        icon={<SidebarChatIcon isDark={isDark} />}
        text={isExpanded ? "收起侧栏" : "展开侧栏"}
        onClick={toggleSidebar}
        aria-label={isExpanded ? "收起侧栏" : "展开侧栏"}
        className={cn(
          "group",
        )}
      />
      <SidebarButton
        icon={<Plus className={cn(
          "h-5 w-5 transition-transform duration-200 group-hover:rotate-90",
          isDark
            ? "text-gray-400 group-hover:text-blue-400"
            : "text-gray-500 group-hover:text-primary"
        )} />}
        text="发起新对话"
        onClick={() => console.log("New chat")}
        aria-label="发起新对话"
        className={cn(
          "group font-medium",
          isDark 
            ? "bg-gray-800/90 hover:bg-gray-700/90 border border-gray-700/50 hover:border-gray-600 shadow-sm hover:shadow-md"
            : "bg-primary/10 hover:bg-primary/15 text-primary shadow-sm hover:shadow-md"
        )}
      />
    </div>
  )
} 