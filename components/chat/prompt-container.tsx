"use client"

import React, { useRef, useEffect } from "react"
import { cn } from "@lib/utils"
import { useTheme, useChatWidth, useWelcomeScreen } from "@lib/hooks"
import { PromptButton } from "@components/ui/prompt-button"
import { Sparkles, ChevronDown, X } from "lucide-react"
import { usePromptPanelStore } from "@lib/stores/ui/prompt-panel-store"

interface PromptContainerProps {
  className?: string
}

// 模拟提示模板数据
const PROMPT_TEMPLATES = [
  {
    id: 1,
    icon: <Sparkles className="w-3.5 h-3.5" />,
    title: "解释概念",
    prompt: "请详细解释[概念]的含义，包括其定义、应用场景和重要性。",
  },
  {
    id: 2,
    icon: <Sparkles className="w-3.5 h-3.5" />,
    title: "总结要点",
    prompt: "请总结[主题]的主要要点，并列出关键观点。",
  },
  {
    id: 3,
    icon: <Sparkles className="w-3.5 h-3.5" />,
    title: "比较不同观点",
    prompt: "请比较[主题]的不同观点，分析各自的优缺点和适用场景。",
  },
  {
    id: 4,
    icon: <Sparkles className="w-3.5 h-3.5" />,
    title: "分析问题",
    prompt: "请分析[问题]的原因、影响和可能的解决方案。",
  },
]

// 推荐按钮数据
const PROMPT_BUTTONS = [
  {
    id: 1,
    title: "提示模板",
    icon: <Sparkles className="w-4 h-4" />,
  },
  {
    id: 2,
    title: "常见问题",
    icon: <Sparkles className="w-4 h-4" />,
  },
  {
    id: 3,
    title: "教学课件",
    icon: <Sparkles className="w-4 h-4" />,
  }
]

export const PromptContainer = ({ className }: PromptContainerProps) => {
  const { isDark } = useTheme()
  const { widthClass, paddingClass } = useChatWidth()
  const { isWelcomeScreen } = useWelcomeScreen()
  const containerRef = useRef<HTMLDivElement>(null)
  
  // 使用新的状态管理
  const { expandedId, position, togglePanel, setPosition, resetPanel } = usePromptPanelStore()
  
  const handlePromptClick = (prompt: string) => {
    console.log("选中提示:", prompt)
    resetPanel()
  }
  
  // 计算并更新面板位置
  const updatePanelPosition = () => {
    if (!containerRef.current || !expandedId) return
    
    const containerRect = containerRef.current.getBoundingClientRect()
    const newPosition = {
      top: containerRect.bottom + window.scrollY + 8, // 8px的间距
      left: containerRect.left + window.scrollX
    }
    
    setPosition(newPosition)
  }
  
  // 监听窗口大小变化，更新面板位置
  useEffect(() => {
    if (expandedId) {
      updatePanelPosition()
      window.addEventListener('resize', updatePanelPosition)
      return () => window.removeEventListener('resize', updatePanelPosition)
    }
  }, [expandedId])
  
  // 组件卸载时重置状态
  useEffect(() => {
    return () => resetPanel()
  }, [])
  
  // 如果不是欢迎界面，不显示
  if (!isWelcomeScreen) return null
  
  return (
    <>
      {/* 按钮容器 */}
      <div 
        ref={containerRef}
        className={cn(
          // 基础样式
          "w-full mx-auto",
          widthClass,
          paddingClass,
          // 欢迎界面时的定位 - 位于中心偏下
          "absolute left-1/2 top-[60%] transform -translate-x-1/2",
          className
        )}
      >
        {/* 提示按钮组 - 水平布局 */}
        <div className="flex justify-center gap-3">
          {PROMPT_BUTTONS.map(button => (
            <PromptButton 
              key={button.id}
              className="animate-pulse-subtle hover:animate-none" 
              onClick={() => togglePanel(button.id)} 
              expanded={expandedId === button.id}
              icon={button.icon}
            >
              {button.title}
            </PromptButton>
          ))}
        </div>
      </div>
      
      {/* 展开的提示面板 - 固定定位 */}
      {expandedId && position && (
        <div
          className={cn(
            "fixed z-50 rounded-xl overflow-hidden",
            "animate-slide-in-down shadow-lg",
            widthClass,
            paddingClass,
            isDark ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"
          )}
          style={{
            top: position.top,
            left: position.left,
            width: containerRef.current?.offsetWidth
          }}
        >
          {/* 头部 */}
          <div className={cn(
            "flex items-center justify-between py-3 px-4 border-b",
            isDark ? "border-gray-700" : "border-gray-200"
          )}>
            <h3 className={cn(
              "text-sm font-medium flex items-center gap-2",
              isDark ? "text-gray-200" : "text-gray-800"
            )}>
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              {PROMPT_BUTTONS.find(b => b.id === expandedId)?.title || "提示模板"}
            </h3>
            <button
              className={cn(
                "p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700",
                "text-gray-500 dark:text-gray-400"
              )}
              onClick={() => resetPanel()}
              aria-label="关闭"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {/* 提示列表 */}
          <div className="p-3 max-h-64 overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PROMPT_TEMPLATES.map((template, index) => (
                <button
                  key={template.id}
                  className={cn(
                    "w-full text-left p-3 rounded-lg border transition-all duration-200",
                    "hover:shadow-md hover:-translate-y-0.5",
                    "animate-fadein flex flex-col",
                    isDark
                      ? "border-gray-700 hover:bg-gray-700 text-gray-300"
                      : "border-gray-200 hover:bg-gray-50 text-gray-700"
                  )}
                  onClick={() => handlePromptClick(template.prompt)}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn(
                      "w-5 h-5 flex items-center justify-center rounded-full",
                      isDark ? "bg-blue-900/50 text-blue-300" : "bg-blue-100 text-blue-600"
                    )}>
                      {template.icon}
                    </span>
                    <span className="font-medium text-sm">{template.title}</span>
                  </div>
                  <p className={cn(
                    "text-xs line-clamp-2",
                    isDark ? "text-gray-400" : "text-gray-500"
                  )}>
                    {template.prompt}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
} 