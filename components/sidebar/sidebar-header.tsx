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
      "flex flex-col gap-2.5 py-4 px-3",
      isDark 
        ? "bg-gradient-to-b from-gray-900 via-gray-900/98 to-transparent" 
        : "bg-gradient-to-b from-background via-background to-transparent"
    )}>
      <SidebarButton
        icon={<SidebarChatIcon />}
        text="收起"
        onClick={toggleSidebar}
        aria-label={isExpanded ? "收起" : "展开"}
        className={cn(
          "group",
          isDark && "hover:border-gray-700"
        )}
      />
      <SidebarButton
        icon={<Plus className={cn(
          "h-5 w-5 transition-transform duration-200 group-hover:rotate-90",
          isDark && "text-gray-400 group-hover:text-gray-200"
        )} />}
        text="发起新对话"
        onClick={() => console.log("New chat")}
        aria-label="发起新对话"
        className={cn(
          "group",
          isDark && "hover:border-gray-700"
        )}
      />
    </div>
  )
} 