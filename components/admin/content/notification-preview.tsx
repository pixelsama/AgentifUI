"use client"

import React from 'react'
import { useTheme } from '@lib/hooks/use-theme'
import { cn } from '@lib/utils'
import { NotificationConfig } from './notification-editor'
import { X, Bell, AlertTriangle, Info, Wrench } from 'lucide-react'

interface NotificationPreviewProps {
  notification: NotificationConfig | null
}

export function NotificationPreview({ notification }: NotificationPreviewProps) {
  const { isDark } = useTheme()

  if (!notification) {
    return (
      <div className={cn(
        "h-full border rounded-lg flex items-center justify-center",
        isDark ? "bg-stone-800 border-stone-600" : "bg-white border-stone-200"
      )}>
        <p className={cn(
          "text-center",
          isDark ? "text-stone-400" : "text-stone-500"
        )}>
          选择一个通知以预览效果
        </p>
      </div>
    )
  }

  // --- BEGIN COMMENT ---
  // 获取通知类型图标
  // --- END COMMENT ---
  const getTypeIcon = () => {
    switch (notification.type) {
      case 'update':
        return <Bell className="h-5 w-5" />
      case 'feature':
        return <Info className="h-5 w-5" />
      case 'maintenance':
        return <Wrench className="h-5 w-5" />
      case 'announcement':
      default:
        return <AlertTriangle className="h-5 w-5" />
    }
  }

  // --- BEGIN COMMENT ---
  // 获取优先级颜色
  // --- END COMMENT ---
  const getPriorityColor = () => {
    switch (notification.priority) {
      case 'critical':
        return isDark ? "text-red-400 bg-red-900/30" : "text-red-600 bg-red-50"
      case 'high':
        return isDark ? "text-orange-400 bg-orange-900/30" : "text-orange-600 bg-orange-50"
      case 'medium':
        return isDark ? "text-blue-400 bg-blue-900/30" : "text-blue-600 bg-blue-50"
      case 'low':
      default:
        return isDark ? "text-stone-400 bg-stone-700" : "text-stone-600 bg-stone-100"
    }
  }

  // --- BEGIN COMMENT ---
  // 渲染中央模态框通知
  // --- END COMMENT ---
  const renderCenterModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className={cn(
        "max-w-md w-full rounded-xl shadow-xl",
        isDark ? "bg-stone-800 border border-stone-600" : "bg-white border border-stone-200"
      )}>
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className={cn(
              "flex items-center gap-3 flex-1",
              getPriorityColor()
            )}>
              {getTypeIcon()}
              <h3 className="font-semibold text-lg">
                {notification.title}
              </h3>
            </div>
            <button className={cn(
              "p-1 rounded hover:bg-gray-100 transition-colors",
              isDark ? "hover:bg-stone-700 text-stone-400" : "hover:bg-stone-100 text-stone-500"
            )}>
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className={cn(
            "mb-6 leading-relaxed",
            isDark ? "text-stone-300" : "text-stone-700"
          )}>
            {notification.content}
          </p>
          <div className="flex gap-3 justify-end">
            <button className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              isDark 
                ? "bg-stone-700 hover:bg-stone-600 text-stone-100" 
                : "bg-stone-100 hover:bg-stone-200 text-stone-700"
            )}>
              稍后提醒
            </button>
            <button className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              isDark 
                ? "bg-stone-100 text-stone-900 hover:bg-white" 
                : "bg-stone-900 text-white hover:bg-stone-800"
            )}>
              知道了
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  // --- BEGIN COMMENT ---
  // 渲染顶部横幅通知
  // --- END COMMENT ---
  const renderTopBanner = () => (
    <div className={cn(
      "w-full p-4 border-b",
      getPriorityColor()
    )}>
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          {getTypeIcon()}
          <div>
            <h4 className="font-medium">{notification.title}</h4>
            <p className="text-sm opacity-90">{notification.content}</p>
          </div>
        </div>
        <button className="p-1 rounded hover:bg-black/10 transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )

  // --- BEGIN COMMENT ---
  // 渲染右下角通知
  // --- END COMMENT ---
  const renderBottomRight = () => (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={cn(
        "max-w-sm rounded-lg shadow-lg border",
        isDark ? "bg-stone-800 border-stone-600" : "bg-white border-stone-200"
      )}>
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className={cn(
              "flex items-center gap-2",
              getPriorityColor()
            )}>
              {getTypeIcon()}
              <h4 className="font-medium text-sm">{notification.title}</h4>
            </div>
            <button className={cn(
              "p-1 rounded hover:bg-gray-100 transition-colors",
              isDark ? "hover:bg-stone-700 text-stone-400" : "hover:bg-stone-100 text-stone-500"
            )}>
              <X className="h-3 w-3" />
            </button>
          </div>
          <p className={cn(
            "text-sm",
            isDark ? "text-stone-300" : "text-stone-600"
          )}>
            {notification.content}
          </p>
        </div>
      </div>
    </div>
  )

  return (
    <div className={cn(
      "h-full border rounded-lg relative overflow-hidden",
      isDark ? "bg-stone-900 border-stone-600" : "bg-stone-50 border-stone-200"
    )}>
      {/* --- BEGIN COMMENT ---
      模拟页面背景
      --- END COMMENT --- */}
      <div className="h-full p-8">
        <div className={cn(
          "max-w-4xl mx-auto",
          isDark ? "text-stone-300" : "text-stone-600"
        )}>
          <h1 className={cn(
            "text-2xl font-bold mb-4",
            isDark ? "text-stone-100" : "text-stone-900"
          )}>
            AgentifUI 平台
          </h1>
          <p className="mb-4">这是一个模拟的应用界面，用于展示通知的显示效果。</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={cn(
              "p-4 rounded-lg",
              isDark ? "bg-stone-800" : "bg-white"
            )}>
              <h3 className={cn(
                "font-semibold mb-2",
                isDark ? "text-stone-100" : "text-stone-900"
              )}>
                功能模块 1
              </h3>
              <p className="text-sm">这里是一些示例内容...</p>
            </div>
            <div className={cn(
              "p-4 rounded-lg",
              isDark ? "bg-stone-800" : "bg-white"
            )}>
              <h3 className={cn(
                "font-semibold mb-2",
                isDark ? "text-stone-100" : "text-stone-900"
              )}>
                功能模块 2
              </h3>
              <p className="text-sm">这里是一些示例内容...</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- BEGIN COMMENT ---
      根据位置渲染通知
      --- END COMMENT --- */}
      {notification.position === 'center' && renderCenterModal()}
      {notification.position === 'top-center' && renderTopBanner()}
      {notification.position === 'bottom-right' && renderBottomRight()}

      {/* --- BEGIN COMMENT ---
      预览说明
      --- END COMMENT --- */}
      <div className="absolute top-4 left-4">
        <div className={cn(
          "px-3 py-1 rounded-full text-xs font-medium",
          isDark ? "bg-stone-700 text-stone-300" : "bg-white text-stone-600"
        )}>
          预览模式 - {notification.position === 'center' ? '中央模态框' : 
                    notification.position === 'top-center' ? '顶部横幅' : '右下角提示'}
        </div>
      </div>
    </div>
  )
} 