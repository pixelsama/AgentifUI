"use client"
import { Plus } from "lucide-react"
import { SidebarButton } from "./sidebar-button"
import { useSidebarStore } from "@lib/stores/sidebar-store"
import { cn } from "@lib/utils"
import { SidebarChatIcon } from "./sidebar-chat-icon"

export function SidebarHeader() {
  const { isExpanded, toggleSidebar } = useSidebarStore()

  return (
    <div className={cn(
      "flex flex-col gap-2.5 py-4 px-3",
      "bg-gradient-to-b from-background via-background to-transparent",
    )}>
      <SidebarButton
        icon={<SidebarChatIcon />}
        text="收起"
        onClick={toggleSidebar}
        aria-label={isExpanded ? "收起" : "展开"}
        className="group"
      />
      <SidebarButton
        icon={<Plus className="h-5 w-5 transition-transform duration-200 group-hover:rotate-90" />}
        text="发起新对话"
        onClick={() => console.log("New chat")}
        aria-label="发起新对话"
        className="group"
      />
    </div>
  )
} 