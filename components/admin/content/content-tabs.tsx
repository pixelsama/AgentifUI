"use client"

import React from 'react'
import { useTheme } from '@lib/hooks/use-theme'
import { cn } from '@lib/utils'
import { FileText, Bell } from 'lucide-react'

interface ContentTabsProps {
  activeTab: 'about' | 'notifications'
  onTabChange: (tab: 'about' | 'notifications') => void
}

export function ContentTabs({ activeTab, onTabChange }: ContentTabsProps) {
  const { isDark } = useTheme()

  const tabs = [
    {
      key: 'about' as const,
      label: 'About页面',
      icon: FileText,
      description: '管理About页面内容'
    },
    {
      key: 'notifications' as const,
      label: '通知管理',
      icon: Bell,
      description: '管理系统通知推送'
    }
  ]

  return (
    <div className={cn(
      "border-b",
      isDark ? "border-stone-600" : "border-stone-200"
    )}>
      <div className="flex">
        {tabs.map(({ key, label, icon: Icon, description }) => (
          <button
            key={key}
            onClick={() => onTabChange(key)}
            className={cn(
              "flex items-center gap-3 px-6 py-4 text-sm font-medium transition-colors relative",
              activeTab === key
                ? isDark ? "text-stone-100 bg-stone-700" : "text-stone-900 bg-stone-50"
                : isDark ? "text-stone-400 hover:text-stone-300" : "text-stone-600 hover:text-stone-700"
            )}
          >
            <Icon className="h-4 w-4" />
            <div className="text-left">
              <div>{label}</div>
              <div className={cn(
                "text-xs mt-0.5",
                activeTab === key
                  ? isDark ? "text-stone-300" : "text-stone-600"
                  : isDark ? "text-stone-500" : "text-stone-500"
              )}>
                {description}
              </div>
            </div>
            
            {/* --- BEGIN COMMENT ---
            活动标签指示器
            --- END COMMENT --- */}
            {activeTab === key && (
              <div className={cn(
                "absolute bottom-0 left-0 right-0 h-0.5",
                isDark ? "bg-stone-100" : "bg-stone-900"
              )} />
            )}
          </button>
        ))}
      </div>
    </div>
  )
} 