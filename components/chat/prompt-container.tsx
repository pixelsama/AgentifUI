"use client"

import React, { useRef, useEffect } from "react"
import { cn } from "@lib/utils"
import { useTheme, useChatWidth, useWelcomeScreen } from "@lib/hooks"
import { PromptButton } from "@components/ui/prompt-button"
import { PromptPanel } from "@components/ui/prompt-panel"
import { Sparkles } from "lucide-react"
import { usePromptPanelStore } from "@lib/stores/ui/prompt-panel-store"
import { useChatLayoutStore, INITIAL_INPUT_HEIGHT } from "@lib/stores/chat-layout-store"

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
  
  // Calculate HALF the offset needed based on input height increase
  const offsetY = Math.max(0, (inputHeight - INITIAL_INPUT_HEIGHT) / 2)
  const baseTopPercentage = 60

  return (
    <div 
      ref={containerRef}
      className={cn(
        "w-full mx-auto relative", // Keep relative here if needed for children, but positioning is absolute
        widthClass,
        paddingClass,
        // Keep original absolute positioning and horizontal centering classes
        "absolute left-1/2 transform -translate-x-1/2",
        // Keep original base top class
        "top-[60%]",
        // Add transition for smooth movement of the top property
        "transition-[top] duration-200 ease-in-out",
        className
      )}
      // Dynamically adjust the top position using calc()
      style={{ 
        top: `calc(${baseTopPercentage}% + ${offsetY}px)`,
        // Ensure transform only handles horizontal centering if needed, 
        // or remove if translate-x-1/2 class handles it.
        // transform: `translateX(-50%)` // Keep only horizontal if needed
      }}
    >
      <div className="flex justify-center gap-3 relative">
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
      
      {expandedId && (
        <PromptPanel
          templates={PROMPT_TEMPLATES}
          title={PROMPT_BUTTONS.find(b => b.id === expandedId)?.title || "提示模板"}
          onClose={resetPanel}
          onSelect={handlePromptClick}
          className="absolute top-full mt-2 w-full left-0 right-0 z-10"
        />
      )}
    </div>
  )
} 