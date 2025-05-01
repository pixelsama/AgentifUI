"use client"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { SidebarButton } from "./sidebar-button"
import { useSidebarStore } from "@lib/stores/sidebar-store"
import { cn } from "@lib/utils"

export function SidebarHeader() {
  const { isExpanded, toggleSidebar } = useSidebarStore()

  return (
    <div className={cn(
      "flex flex-col gap-2.5 py-4 px-3",
      "bg-gradient-to-b from-background via-background to-transparent",
    )}>
      <SidebarButton
        icon={isExpanded 
          ? <ChevronLeft className="h-5 w-5 transition-transform duration-200 group-hover:-translate-x-0.5" /> 
          : <ChevronRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-0.5" />
        }
        text="折叠侧边栏"
        onClick={toggleSidebar}
        aria-label={isExpanded ? "折叠侧边栏" : "展开侧边栏"}
        className="group"
      />
      <SidebarButton
        icon={<Plus className="h-5 w-5 transition-transform duration-200 group-hover:rotate-90" />}
        text="新建聊天"
        onClick={() => console.log("New chat")}
        aria-label="新建聊天"
        className="group"
      />
    </div>
  )
} 