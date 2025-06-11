"use client"

import React, { useState, useRef } from 'react'
import { useTheme } from '@lib/hooks/use-theme'
import { cn } from '@lib/utils'
import { NotificationConfig } from './notification-editor'
import { X, Bell, AlertTriangle, Info, Wrench, Move } from 'lucide-react'

interface NotificationPreviewProps {
  notification: NotificationConfig | null
}

export function NotificationPreview({ notification }: NotificationPreviewProps) {
  const { isDark } = useTheme()
  const [position, setPosition] = useState({ x: 50, y: 50 }) // 百分比位置
  const [isDragging, setIsDragging] = useState(false)
  const dragRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  if (!notification) {
    return (
      <div className={cn(
        "h-full border rounded-lg flex items-center justify-center",
        isDark ? "bg-stone-800 border-stone-600" : "bg-white border-stone-200"
      )}>
        <p className={cn(
          "text-center text-sm",
          isDark ? "text-stone-400" : "text-stone-500"
        )}>
          选择一个通知以预览效果
        </p>
      </div>
    )
  }

  // --- BEGIN COMMENT ---
  // 拖拽处理函数
  // --- END COMMENT ---
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return
      
      const container = containerRef.current.getBoundingClientRect()
      const x = ((e.clientX - container.left) / container.width) * 100
      const y = ((e.clientY - container.top) / container.height) * 100
      
      setPosition({
        x: Math.max(0, Math.min(100, x)),
        y: Math.max(0, Math.min(100, y))
      })
    }
    
    const handleMouseUp = () => {
      setIsDragging(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  // --- BEGIN COMMENT ---
  // 获取通知类型图标
  // --- END COMMENT ---
  const getTypeIcon = () => {
    switch (notification.type) {
      case 'update':
        return <Bell className="h-4 w-4" />
      case 'feature':
        return <Info className="h-4 w-4" />
      case 'maintenance':
        return <Wrench className="h-4 w-4" />
      case 'announcement':
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  // --- BEGIN COMMENT ---
  // 获取优先级样式 (使用stone配色)
  // --- END COMMENT ---
  const getPriorityStyles = () => {
    switch (notification.priority) {
      case 'critical':
        return {
          border: isDark ? "border-red-500/50" : "border-red-300",
          bg: isDark ? "bg-stone-800/95" : "bg-stone-50/95",
          iconColor: isDark ? "text-red-400" : "text-red-600"
        }
      case 'high':
        return {
          border: isDark ? "border-orange-500/50" : "border-orange-300",
          bg: isDark ? "bg-stone-800/95" : "bg-stone-50/95",
          iconColor: isDark ? "text-orange-400" : "text-orange-600"
        }
      case 'medium':
        return {
          border: isDark ? "border-stone-500/50" : "border-stone-300",
          bg: isDark ? "bg-stone-800/95" : "bg-stone-50/95",
          iconColor: isDark ? "text-stone-400" : "text-stone-600"
        }
      case 'low':
      default:
        return {
          border: isDark ? "border-stone-600/50" : "border-stone-200",
          bg: isDark ? "bg-stone-800/95" : "bg-stone-50/95",
          iconColor: isDark ? "text-stone-500" : "text-stone-500"
        }
    }
  }

  const styles = getPriorityStyles()

  // --- BEGIN COMMENT ---
  // 渲染可拖拽的通知组件
  // --- END COMMENT ---
  const renderDraggableNotification = () => {
    if (notification.position === 'top-center') {
      return (
        <div 
          className={cn(
            "absolute top-0 left-1/2 transform -translate-x-1/2 w-full max-w-md p-3 border-b shadow-sm",
            styles.border,
            styles.bg
          )}
          style={{ zIndex: 1000 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={styles.iconColor}>
                {getTypeIcon()}
              </span>
              <div>
                <h4 className={cn(
                  "font-medium text-sm",
                  isDark ? "text-stone-100" : "text-stone-900"
                )}>
                  {notification.title}
                </h4>
                <p className={cn(
                  "text-xs",
                  isDark ? "text-stone-300" : "text-stone-600"
                )}>
                  {notification.content}
                </p>
              </div>
            </div>
            <button className={cn(
              "p-1 rounded hover:bg-stone-500/20 transition-colors",
              isDark ? "text-stone-400" : "text-stone-500"
            )}>
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      )
    }

    if (notification.position === 'bottom-right') {
      return (
        <div 
          className={cn(
            "absolute bottom-4 right-4 max-w-sm rounded-lg shadow-lg border backdrop-blur-sm",
            styles.border,
            styles.bg
          )}
          style={{ zIndex: 1000 }}
        >
          <div className="p-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={styles.iconColor}>
                  {getTypeIcon()}
                </span>
                <h4 className={cn(
                  "font-medium text-sm",
                  isDark ? "text-stone-100" : "text-stone-900"
                )}>
                  {notification.title}
                </h4>
              </div>
              <button className={cn(
                "p-1 rounded hover:bg-stone-500/20 transition-colors",
                isDark ? "text-stone-400" : "text-stone-500"
              )}>
                <X className="h-3 w-3" />
              </button>
            </div>
            <p className={cn(
              "text-sm leading-relaxed",
              isDark ? "text-stone-300" : "text-stone-600"
            )}>
              {notification.content}
            </p>
          </div>
        </div>
      )
    }

    // center position - 可拖拽的模态框样式
    return (
      <div 
        ref={dragRef}
        className={cn(
          "absolute max-w-md rounded-xl shadow-xl border backdrop-blur-sm cursor-move",
          styles.border,
          styles.bg,
          isDragging ? "cursor-grabbing" : "cursor-grab"
        )}
        style={{ 
          left: `${position.x}%`, 
          top: `${position.y}%`,
          transform: 'translate(-50%, -50%)',
          zIndex: 1000
        }}
        onMouseDown={handleMouseDown}
      >
        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3 flex-1">
              <span className={styles.iconColor}>
                {getTypeIcon()}
              </span>
              <h3 className={cn(
                "font-semibold",
                isDark ? "text-stone-100" : "text-stone-900"
              )}>
                {notification.title}
              </h3>
            </div>
            <div className="flex items-center gap-1">
              <Move className={cn(
                "h-3 w-3",
                isDark ? "text-stone-500" : "text-stone-400"
              )} />
              <button className={cn(
                "p-1 rounded hover:bg-stone-500/20 transition-colors",
                isDark ? "text-stone-400" : "text-stone-500"
              )}>
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
          <p className={cn(
            "mb-4 leading-relaxed text-sm",
            isDark ? "text-stone-300" : "text-stone-700"
          )}>
            {notification.content}
          </p>
          <div className="flex gap-2 justify-end">
            <button className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
              isDark 
                ? "bg-stone-700 hover:bg-stone-600 text-stone-100" 
                : "bg-stone-100 hover:bg-stone-200 text-stone-700"
            )}>
              稍后提醒
            </button>
            <button className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
              isDark 
                ? "bg-stone-100 text-stone-900 hover:bg-white" 
                : "bg-stone-900 text-white hover:bg-stone-800"
            )}>
              知道了
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={containerRef}
      className={cn(
        "h-full border rounded-lg relative overflow-hidden",
        isDark ? "bg-stone-900 border-stone-600" : "bg-stone-50 border-stone-200"
      )}
    >
      {/* --- BEGIN COMMENT ---
      模拟页面背景内容
      --- END COMMENT --- */}
      <div className="h-full p-6">
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
          <p className="mb-4 text-sm">这是一个模拟的应用界面，用于展示通知的显示效果。</p>
          <div className={cn(
            "grid grid-cols-1 md:grid-cols-2 gap-4 mb-6",
          )}>
            <div className={cn(
              "p-4 rounded-lg border",
              isDark ? "bg-stone-800 border-stone-600" : "bg-white border-stone-200"
            )}>
              <h3 className={cn(
                "font-medium mb-2",
                isDark ? "text-stone-100" : "text-stone-900"
              )}>
                功能模块
              </h3>
              <p className={cn(
                "text-sm",
                isDark ? "text-stone-400" : "text-stone-600"
              )}>
                这里是一些示例内容，用于展示通知在真实页面中的显示效果。
              </p>
            </div>
            <div className={cn(
              "p-4 rounded-lg border",
              isDark ? "bg-stone-800 border-stone-600" : "bg-white border-stone-200"
            )}>
              <h3 className={cn(
                "font-medium mb-2",
                isDark ? "text-stone-100" : "text-stone-900"
              )}>
                数据统计
              </h3>
              <p className={cn(
                "text-sm",
                isDark ? "text-stone-400" : "text-stone-600"
              )}>
                通知会根据设置的位置显示在页面的不同区域。
              </p>
            </div>
          </div>
          
          {/* --- BEGIN COMMENT ---
          位置调整提示
          --- END COMMENT --- */}
          {notification.position === 'center' && (
            <div className={cn(
              "text-xs p-2 rounded border",
              isDark ? "bg-stone-800 border-stone-600 text-stone-400" : "bg-stone-100 border-stone-200 text-stone-600"
            )}>
              💡 提示：中央通知支持拖拽调整位置
            </div>
          )}
        </div>
      </div>

      {/* --- BEGIN COMMENT ---
      渲染通知 (无背景遮罩，页面融合式)
      --- END COMMENT --- */}
      {notification.isActive && renderDraggableNotification()}
    </div>
  )
} 