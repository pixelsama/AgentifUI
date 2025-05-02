"use client"

import React, { useRef, useEffect } from "react"
import { X, Sparkles, Info } from "lucide-react"
import { cn } from "@lib/utils"
import { useTheme } from "@lib/hooks/use-theme"
import { usePromptModalStore } from "@lib/stores/ui/prompt-modal-store"

// 模拟提示模板数据
const PROMPT_TEMPLATES = [
  {
    id: 1,
    icon: <Sparkles className="w-4 h-4" />,
    title: "解释概念",
    prompt: "请详细解释[概念]的含义，包括其定义、应用场景和重要性。",
  },
  {
    id: 2,
    icon: <Sparkles className="w-4 h-4" />,
    title: "总结要点",
    prompt: "请总结[主题]的主要要点，并列出关键观点。",
  },
  {
    id: 3,
    icon: <Sparkles className="w-4 h-4" />,
    title: "比较不同观点",
    prompt: "请比较[主题]的不同观点，分析各自的优缺点和适用场景。",
  },
  {
    id: 4,
    icon: <Sparkles className="w-4 h-4" />,
    title: "分析问题",
    prompt: "请分析[问题]的原因、影响和可能的解决方案。",
  },
]

interface PromptCardProps {
  icon: React.ReactNode
  title: string
  prompt: string
  onClick: () => void
  index: number
}

function PromptCard({ icon, title, prompt, onClick, index }: PromptCardProps) {
  const { isDark } = useTheme()
  
  return (
    <button
      className={cn(
        "w-full text-left p-3 rounded-lg transition-all duration-200",
        "border hover:shadow-md transform hover:-translate-y-1",
        "animate-fadein",
        isDark
          ? "border-gray-700 hover:bg-gray-800 text-gray-300 hover:border-gray-600"
          : "border-gray-200 hover:bg-gray-50 text-gray-700 hover:border-gray-300",
      )}
      onClick={onClick}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className={cn(
          "w-6 h-6 flex items-center justify-center rounded-full",
          isDark ? "bg-blue-900/50 text-blue-300" : "bg-blue-100 text-blue-600"
        )}>
          {icon}
        </span>
        <span className="font-medium">{title}</span>
      </div>
      <p className={cn(
        "text-sm line-clamp-2",
        isDark ? "text-gray-400" : "text-gray-500"
      )}>
        {prompt}
      </p>
    </button>
  )
}

export function PromptModal() {
  const { isDark } = useTheme()
  const { isOpen, closeModal } = usePromptModalStore()
  const modalRef = useRef<HTMLDivElement>(null)
  
  // 处理点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        closeModal()
      }
    }
    
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, closeModal])
  
  // 添加键盘快捷键
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal()
      }
    }
    
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown)
    }
    
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, closeModal])
  
  // 阻止滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])
  
  if (!isOpen) return null
  
  const handlePromptClick = (prompt: string) => {
    // 这里可以将选中的提示添加到输入框
    console.log("选中提示:", prompt)
    closeModal()
  }
  
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-fadein" />
      
      <div
        ref={modalRef}
        className={cn(
          "relative w-full max-w-lg max-h-[85vh] overflow-auto rounded-t-xl sm:rounded-xl",
          "animate-slide-in-down",
          isDark ? "bg-gray-900 border border-gray-700" : "bg-white",
          "shadow-2xl"
        )}
      >
        {/* 头部 */}
        <div className={cn(
          "sticky top-0 z-10 flex items-center justify-between p-4 border-b backdrop-blur-sm",
          isDark ? "border-gray-800 bg-gray-900/90" : "border-gray-200 bg-white/90"
        )}>
          <h3 className={cn(
            "font-medium flex items-center gap-2",
            isDark ? "text-gray-200" : "text-gray-800"
          )}>
            <Sparkles className="w-4 h-4 text-blue-500" />
            提示模板
          </h3>
          <button
            className={cn(
              "p-1.5 rounded-full transition-all duration-200",
              isDark 
                ? "hover:bg-gray-800 text-gray-400 hover:text-gray-200" 
                : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
            )}
            onClick={closeModal}
            aria-label="关闭"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {/* 内容 */}
        <div className="p-4">
          <div className={cn(
            "p-3 mb-4 rounded-lg flex items-start gap-3 text-sm",
            isDark ? "bg-gray-800/50 text-gray-300" : "bg-gray-50 text-gray-700"
          )}>
            <Info className="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-500" />
            <p>提示模板可以帮助你快速构建有效的问题，点击模板将其添加到输入框。</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PROMPT_TEMPLATES.map((template, index) => (
              <PromptCard
                key={template.id}
                icon={template.icon}
                title={template.title}
                prompt={template.prompt}
                onClick={() => handlePromptClick(template.prompt)}
                index={index}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 