"use client"

import React from "react"
import { Sparkles, X, Check } from "lucide-react"
import { cn } from "@lib/utils"
import { useTheme } from "@lib/hooks"

interface PromptTemplate {
  id: number | string  // 更新类型支持字符串ID
  icon: React.ReactNode
  title: string
  prompt: string
  isSelected?: boolean // 添加选中状态
}

interface PromptPanelProps {
  templates: PromptTemplate[]
  title: string
  onClose: () => void
  onSelect: (template: PromptTemplate) => void  // 修改为传递整个模板对象
  className?: string
}

export function PromptPanel({
  templates,
  title,
  onClose,
  onSelect,
  className,
}: PromptPanelProps) {
  const { isDark } = useTheme()

  return (
    <div
      className={cn(
        "z-50 rounded-xl overflow-hidden",
        "animate-slide-in-down shadow-lg",
        isDark ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200",
        className
      )}
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
          {title}
        </h3>
        <button
          className={cn(
            "p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700",
            "text-gray-500 dark:text-gray-400"
          )}
          onClick={onClose}
          aria-label="关闭"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      {/* 提示列表 */}
      <div className="p-3 max-h-64 overflow-y-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {templates.map((template, index) => (
            <button
              key={template.id}
              className={cn(
                "w-full text-left p-3 rounded-lg border transition-all duration-200",
                "hover:shadow-md hover:-translate-y-0.5",
                "animate-fadein flex flex-col",
                template.isSelected 
                  ? isDark 
                    ? "border-blue-500 bg-blue-900/20 text-blue-200"
                    : "border-blue-500 bg-blue-50 text-blue-800"
                  : isDark
                    ? "border-gray-700 hover:bg-gray-700 text-gray-300"
                    : "border-gray-200 hover:bg-gray-50 text-gray-700"
              )}
              onClick={() => onSelect(template)}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={cn(
                  "w-5 h-5 flex items-center justify-center rounded-full",
                  template.isSelected
                    ? isDark ? "bg-blue-600 text-white" : "bg-blue-500 text-white"
                    : isDark ? "bg-blue-900/50 text-blue-300" : "bg-blue-100 text-blue-600"
                )}>
                  {template.isSelected ? <Check className="h-3 w-3" /> : template.icon}
                </span>
                <span className="font-medium text-sm">{template.title}</span>
              </div>
              <p className={cn(
                "text-xs line-clamp-2",
                template.isSelected
                  ? isDark ? "text-blue-200" : "text-blue-700"
                  : isDark ? "text-gray-400" : "text-gray-500"
              )}>
                {template.prompt}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
} 