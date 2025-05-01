"use client"

import * as React from "react"
import { MessageSquare, Grid, ChevronDown, ChevronUp, Sparkles, Book, Code, Image, FileText } from "lucide-react"
import { useSidebarStore } from "@lib/stores/sidebar-store"
import { SidebarButton } from "./sidebar-button"
import { useTheme } from "@lib/hooks/use-theme"
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
  const { isDark } = useTheme()
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
    <div className="relative flex-1 overflow-hidden">
      {/* 上边界线 - 只在展开时显示 */}
      <div className={cn(
        "absolute top-0 left-0 right-0 h-px z-10",
        "transition-all duration-300 ease-in-out",
        isDark ? "bg-gray-700/60" : "bg-gray-200/50",
        isExpanded ? "opacity-100" : "opacity-0"
      )} />
      
      <div
        className={cn(
          "absolute inset-0 flex flex-col gap-6 overflow-y-auto pb-4 pt-4",
          "scrollbar-thin scrollbar-track-transparent",
          isDark 
            ? "scrollbar-thumb-gray-600" 
            : "scrollbar-thumb-accent",
          "transition-all duration-300 ease-in-out",
          isExpanded ? "opacity-100 transform-none" : "opacity-0 -translate-x-2 pointer-events-none",
        )}
      >
        {/* 聊天历史部分 */}
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
                active={chat.id === 1}
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

        {/* 分隔线 - 中间 (仅亮色模式显示) */}
        {!isDark && (
          <div className="h-px mx-4 bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
        )}

        {/* 应用部分 */}
        <div className="space-y-3 px-3">
          <div className={cn(
            "px-3 text-xs font-semibold flex items-center gap-2",
            isDark ? "text-blue-400" : "text-primary/90"
          )}>
            <Grid className="h-3.5 w-3.5" />
            <span>应用列表</span>
          </div>
          <div className="space-y-1.5">
            {visibleApps.map((app) => (
              <SidebarButton 
                key={app.id} 
                icon={app.icon} 
                text={app.title}
                active={app.id === 1}
                className="w-full group"
              />
            ))}
            {applications.length > 2 && (
              <SidebarButton
                icon={showAllApps 
                  ? <ChevronUp className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5" /> 
                  : <ChevronDown className="h-4 w-4 transition-transform duration-200 group-hover:translate-y-0.5" />
                }
                text={showAllApps ? "收起" : "更多"}
                className={cn(
                  "w-full text-xs group",
                  isDark ? "text-gray-500" : "text-muted-foreground"
                )}
                onClick={toggleShowAllApps}
              />
            )}
          </div>
        </div>
      </div>

      {/* 下边界线 - 只在展开时显示 */}
      <div className={cn(
        "absolute bottom-0 left-0 right-0 h-px z-10",
        "transition-all duration-300 ease-in-out",
        isDark ? "bg-gray-700/60" : "bg-gray-200/50",
        isExpanded ? "opacity-100" : "opacity-0"
      )} />

      {/* 折叠状态 - 保持空白 */}
      <div
        className={cn(
          "absolute inset-0 transition-all duration-300 ease-in-out",
          isExpanded ? "opacity-0 translate-x-2 pointer-events-none" : "opacity-100 transform-none",
        )}
      />
    </div>
  )
} 