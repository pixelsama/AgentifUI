"use client"

import * as React from "react"
import { MessageSquare, Grid, ChevronDown, ChevronUp, Sparkles, Book, Code, Image, FileText } from "lucide-react"
import { useSidebarStore } from "@lib/stores/sidebar-store"
import { SidebarButton } from "./sidebar-button"
import { cn } from "@lib/utils"

// 示例数据 - 优化图标和文案
const chatHistory = [
  { id: 1, title: "网站开发指南", icon: <Code className="h-4 w-4" /> },
  { id: 2, title: "JavaScript最佳实践", icon: <Code className="h-4 w-4" /> },
  { id: 3, title: "React Hooks详解", icon: <Code className="h-4 w-4" /> },
  { id: 4, title: "Grid与Flexbox比较", icon: <Code className="h-4 w-4" /> },
  { id: 5, title: "TypeScript技巧", icon: <Code className="h-4 w-4" /> },
  { id: 6, title: "Next.js App Router", icon: <Code className="h-4 w-4" /> },
]

const applications = [
  { id: 1, title: "代码助手", icon: <Code className="h-4 w-4" /> },
  { id: 2, title: "数学求解器", icon: <Sparkles className="h-4 w-4" /> },
  { id: 3, title: "图像生成器", icon: <Image className="h-4 w-4" /> },
  { id: 4, title: "文档助手", icon: <FileText className="h-4 w-4" /> },
]

export function SidebarContent() {
  const { isExpanded, lockExpanded } = useSidebarStore()
  const [showAllChats, setShowAllChats] = React.useState(false)
  const [showAllApps, setShowAllApps] = React.useState(false)

  // 确定显示项目数量
  const visibleChats = showAllChats ? chatHistory : chatHistory.slice(0, 3)
  const visibleApps = showAllApps ? applications : applications.slice(0, 2)

  const toggleShowAllChats = () => {
    setShowAllChats(!showAllChats)
    lockExpanded()
  }

  const toggleShowAllApps = () => {
    setShowAllApps(!showAllApps)
    lockExpanded()
  }

  return (
    <div className="relative flex-1 overflow-hidden px-3">
      {/* 展开状态内容 */}
      <div
        className={cn(
          "absolute inset-0 flex flex-col gap-6 overflow-y-auto pb-4 px-3",
          "scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent",
          "transition-all duration-300 ease-in-out",
          isExpanded ? "opacity-100 transform-none" : "opacity-0 -translate-x-2 pointer-events-none",
        )}
      >
        {/* 聊天历史部分 */}
        <div className="space-y-3 pt-2">
          <div className="px-3 text-xs font-medium text-muted-foreground flex items-center gap-2">
            <MessageSquare className="h-3.5 w-3.5" />
            <span>最近聊天</span>
          </div>
          <div className="space-y-1.5">
            {visibleChats.map((chat) => (
              <SidebarButton
                key={chat.id}
                icon={chat.icon}
                text={chat.title}
                className="w-full group"
              />
            ))}
            {chatHistory.length > 3 && (
              <SidebarButton
                icon={showAllChats 
                  ? <ChevronUp className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5" /> 
                  : <ChevronDown className="h-4 w-4 transition-transform duration-200 group-hover:translate-y-0.5" />
                }
                text={showAllChats ? "显示更少" : "显示更多"}
                className="w-full text-xs text-muted-foreground hover:text-muted-foreground/90 group"
                onClick={toggleShowAllChats}
              />
            )}
          </div>
        </div>

        {/* 应用部分 */}
        <div className="space-y-3">
          <div className="px-3 text-xs font-medium text-muted-foreground flex items-center gap-2">
            <Grid className="h-3.5 w-3.5" />
            <span>应用功能</span>
          </div>
          <div className="space-y-1.5">
            {visibleApps.map((app) => (
              <SidebarButton 
                key={app.id} 
                icon={app.icon} 
                text={app.title} 
                className="w-full group" 
              />
            ))}
            {applications.length > 2 && (
              <SidebarButton
                icon={showAllApps 
                  ? <ChevronUp className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5" /> 
                  : <ChevronDown className="h-4 w-4 transition-transform duration-200 group-hover:translate-y-0.5" />
                }
                text={showAllApps ? "显示更少" : "显示更多"}
                className="w-full text-xs text-muted-foreground hover:text-muted-foreground/90 group"
                onClick={toggleShowAllApps}
              />
            )}
          </div>
        </div>
      </div>

      {/* 折叠状态图标视图 */}
      <div
        className={cn(
          "absolute inset-0 flex flex-col items-center gap-6 py-4",
          "transition-all duration-300 ease-in-out",
          isExpanded ? "opacity-0 translate-x-2 pointer-events-none" : "opacity-100 transform-none",
        )}
      >
        {/* 添加折叠状态下的图标指示 */}
        <div className="flex flex-col items-center gap-3">
          <MessageSquare className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
          <Grid className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
        </div>
      </div>
    </div>
  )
} 