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
        icon={
          <div className="flex flex-col justify-center items-start space-y-1 w-4 group-hover:scale-105 transition-transform duration-200">
            <div className="h-[2px] w-4 bg-current rounded-full transition-all duration-200 group-hover:w-full" />
            <div className="h-[2px] w-3 bg-current rounded-full transition-all duration-200 group-hover:w-4/5" />
            <div className="h-[2px] w-2 bg-current rounded-full transition-all duration-200 group-hover:w-3/5" />
          </div>
        }
        text="菜单"
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