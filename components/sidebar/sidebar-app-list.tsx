"use client"

import * as React from "react"
import { Grid, ChevronDown, ChevronUp, Sparkles, Image, FileText, Code } from "lucide-react"
import { SidebarButton } from "./sidebar-button"
import { cn } from "@lib/utils"
import { useSidebarStore } from "@lib/stores/sidebar-store"

const applications = [
  { id: 1, title: "代码助手", icon: <Code className="h-4 w-4" /> },
  { id: 2, title: "数学求解器", icon: <Sparkles className="h-4 w-4" /> },
  { id: 3, title: "图像生成器", icon: <Image className="h-4 w-4" /> },
  { id: 4, title: "文档助手", icon: <FileText className="h-4 w-4" /> },
]

interface SidebarAppListProps {
  isDark: boolean
  contentVisible: boolean
  /** 当前选中的应用ID */
  selectedId: string | number | null
  /** 选中应用项的回调函数 */
  onSelectApp: (appId: string | number) => void
}

/**
 * 侧边栏应用列表组件
 * 
 * 显示可用的应用列表，支持折叠/展开和项目选择
 */
export function SidebarAppList({ 
  isDark, 
  contentVisible,
  selectedId,
  onSelectApp
}: SidebarAppListProps) {
  const { lockExpanded } = useSidebarStore()
  const [showAllApps, setShowAllApps] = React.useState(false)
  const visibleApps = showAllApps ? applications : applications.slice(0, 2)

  const toggleShowAllApps = () => {
    setShowAllApps(!showAllApps)
    lockExpanded() // Keep sidebar expanded when toggling
  }

  return (
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
            active={selectedId === app.id}
            className="w-full group"
            onClick={() => onSelectApp(app.id)}
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
  )
} 