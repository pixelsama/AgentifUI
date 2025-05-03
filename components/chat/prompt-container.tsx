"use client"

import React, { useRef, useEffect } from "react"
import { cn } from "@lib/utils"
import { useTheme, useChatWidth, useWelcomeScreen } from "@lib/hooks"
import { PromptButton } from "@components/ui/prompt-button"
import { PromptPanel } from "@components/ui/prompt-panel"
import { Sparkles, HelpCircle, BookOpen } from "lucide-react"
import { usePromptPanelStore } from "@lib/stores/ui/prompt-panel-store"
import { useChatLayoutStore, INITIAL_INPUT_HEIGHT } from "@lib/stores/chat-layout-store"
import { PROMPT_BUTTONS, PROMPT_TEMPLATES } from "../../templates/prompt.json"

interface PromptContainerProps {
  className?: string
}

// 定义按钮图标映射
const BUTTON_ICONS = {
  1: Sparkles,
  2: HelpCircle,
  3: BookOpen
}

export const PromptContainer = ({ className }: PromptContainerProps) => {
  const { isDark } = useTheme()
  const { widthClass, paddingClass } = useChatWidth()
  const { isWelcomeScreen } = useWelcomeScreen()
  const containerRef = useRef<HTMLDivElement>(null)
  const { expandedId, togglePanel, resetPanel } = usePromptPanelStore()
  const { inputHeight } = useChatLayoutStore()
  
  const handlePromptClick = (prompt: string) => {
    console.log("选中提示:", prompt)
    resetPanel()
  }
  
  useEffect(() => {
    return () => resetPanel()
  }, [resetPanel])

  if (!isWelcomeScreen) return null
  
  // 计算基于输入框高度增加的半个偏移量
  const offsetY = Math.max(0, (inputHeight - INITIAL_INPUT_HEIGHT) / 2)
  
  // 调整此值以更改初始垂直位置
  const baseTopPercentage = 50 

  return (
    <div 
      ref={containerRef}
      className={cn(
        "w-full mx-auto relative",
        widthClass,
        paddingClass,
        "absolute left-1/2 transform -translate-x-1/2",
        "transition-[top] duration-200 ease-in-out",
        className
      )}
      style={{ 
        top: `calc(${baseTopPercentage}% + ${offsetY}px)`, 
      }}
    >
      <div className="flex justify-center gap-3 relative">
        {PROMPT_BUTTONS.map(button => {
          const Icon = BUTTON_ICONS[button.id as keyof typeof BUTTON_ICONS]
          return (
            <PromptButton 
              key={button.id}
              className="animate-pulse-subtle hover:animate-none" 
              onClick={() => togglePanel(button.id)} 
              expanded={expandedId === button.id}
              icon={<Sparkles className="h-4 w-4" />}
            >
              {button.title}
            </PromptButton>
          )
        })}
      </div>
      
      {expandedId && (
        <PromptPanel
          templates={PROMPT_TEMPLATES.map(template => ({
            ...template,
            icon: <Sparkles className="h-4 w-4" />
          }))}
          title={PROMPT_BUTTONS.find(b => b.id === expandedId)?.title || "提示模板"}
          onClose={resetPanel}
          onSelect={handlePromptClick}
          className="absolute top-full mt-2 w-full left-0 right-0 z-10"
        />
      )}
    </div>
  )
} 