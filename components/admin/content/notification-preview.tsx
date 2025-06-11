"use client"

import React, { useState, useRef } from 'react'
import { useTheme } from '@lib/hooks/use-theme'
import { cn } from '@lib/utils'
import { NotificationConfig } from './notification-editor'
import { X, Bell, AlertTriangle, Info, Wrench, Move, Calendar, Users, MapPin } from 'lucide-react'

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
        "h-full flex items-center justify-center",
        isDark ? "bg-stone-900" : "bg-stone-50"
      )}>
        <div className={cn(
          "text-center p-8 rounded-xl border",
          isDark ? "bg-stone-800 border-stone-600" : "bg-white border-stone-200"
        )}>
          <Bell className={cn(
            "h-12 w-12 mx-auto mb-4",
            isDark ? "text-stone-600" : "text-stone-400"
          )} />
          <p className={cn(
            "text-lg font-medium mb-2",
            isDark ? "text-stone-300" : "text-stone-600"
          )}>
            选择通知预览
          </p>
          <p className={cn(
            "text-sm",
            isDark ? "text-stone-400" : "text-stone-500"
          )}>
            从左侧选择一个通知来预览其显示效果
          </p>
        </div>
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
        x: Math.max(5, Math.min(95, x)),
        y: Math.max(5, Math.min(95, y))
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
  // 获取通知类型图标和颜色
  // --- END COMMENT ---
  const getTypeStyles = () => {
    switch (notification.type) {
      case 'update':
        return {
          icon: <Bell className="h-5 w-5" />,
          color: isDark ? "text-blue-400" : "text-blue-600",
          bg: isDark ? "bg-blue-500/10" : "bg-blue-50",
          border: isDark ? "border-blue-500/20" : "border-blue-200",
          label: "产品更新"
        }
      case 'feature':
        return {
          icon: <Info className="h-5 w-5" />,
          color: isDark ? "text-green-400" : "text-green-600",
          bg: isDark ? "bg-green-500/10" : "bg-green-50",
          border: isDark ? "border-green-500/20" : "border-green-200",
          label: "新功能"
        }
      case 'maintenance':
        return {
          icon: <Wrench className="h-5 w-5" />,
          color: isDark ? "text-orange-400" : "text-orange-600",
          bg: isDark ? "bg-orange-500/10" : "bg-orange-50",
          border: isDark ? "border-orange-500/20" : "border-orange-200",
          label: "系统维护"
        }
      case 'announcement':
      default:
        return {
          icon: <AlertTriangle className="h-5 w-5" />,
          color: isDark ? "text-purple-400" : "text-purple-600",
          bg: isDark ? "bg-purple-500/10" : "bg-purple-50",
          border: isDark ? "border-purple-500/20" : "border-purple-200",
          label: "重要公告"
        }
    }
  }

  const typeStyles = getTypeStyles()

  // --- BEGIN COMMENT ---
  // 获取优先级样式
  // --- END COMMENT ---
  const getPriorityBadge = () => {
    const baseClasses = "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
    
    switch (notification.priority) {
      case 'critical':
        return {
          className: cn(baseClasses, isDark ? "bg-red-500/20 text-red-400" : "bg-red-100 text-red-700"),
          label: "紧急"
        }
      case 'high':
        return {
          className: cn(baseClasses, isDark ? "bg-orange-500/20 text-orange-400" : "bg-orange-100 text-orange-700"),
          label: "高"
        }
      case 'medium':
        return {
          className: cn(baseClasses, isDark ? "bg-stone-500/20 text-stone-400" : "bg-stone-100 text-stone-700"),
          label: "中"
        }
      case 'low':
      default:
        return {
          className: cn(baseClasses, isDark ? "bg-stone-600/20 text-stone-500" : "bg-stone-50 text-stone-600"),
          label: "低"
        }
    }
  }

  const priorityBadge = getPriorityBadge()

  // --- BEGIN COMMENT ---
  // 渲染现代化通知卡片
  // --- END COMMENT ---
  const renderModernNotification = () => {
    if (notification.position === 'top-center') {
      return (
        <div className={cn(
          "absolute top-0 left-0 right-0 shadow-lg backdrop-blur-sm border-b z-[1000]",
          typeStyles.bg,
          typeStyles.border
        )}>
          <div className="max-w-4xl mx-auto p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-lg", typeStyles.bg)}>
                  <span className={typeStyles.color}>
                    {typeStyles.icon}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={cn(
                      "font-semibold",
                      isDark ? "text-stone-100" : "text-stone-900"
                    )}>
                      {notification.title}
                    </h4>
                    <span className={priorityBadge.className}>
                      {priorityBadge.label}
                    </span>
                  </div>
                  <p className={cn(
                    "text-sm",
                    isDark ? "text-stone-300" : "text-stone-600"
                  )}>
                    {notification.content}
                  </p>
                </div>
              </div>
              <button className={cn(
                "p-2 rounded-full hover:bg-stone-500/10 transition-colors",
                isDark ? "text-stone-400" : "text-stone-500"
              )}>
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )
    }

    if (notification.position === 'bottom-right') {
      return (
        <div className={cn(
          "absolute bottom-6 right-6 max-w-sm rounded-xl shadow-xl border backdrop-blur-sm z-[1000]",
          isDark ? "bg-stone-800/95 border-stone-600" : "bg-white/95 border-stone-200"
        )}>
          <div className="p-5">
            <div className="flex items-start gap-3">
              <div className={cn("p-2 rounded-lg flex-shrink-0", typeStyles.bg)}>
                <span className={typeStyles.color}>
                  {typeStyles.icon}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <span className={cn("text-xs font-medium", typeStyles.color)}>
                    {typeStyles.label}
                  </span>
                  <button className={cn(
                    "p-1 rounded-full hover:bg-stone-500/10 transition-colors",
                    isDark ? "text-stone-400" : "text-stone-500"
                  )}>
                    <X className="h-3 w-3" />
                  </button>
                </div>
                <h4 className={cn(
                  "font-semibold mb-1 text-sm",
                  isDark ? "text-stone-100" : "text-stone-900"
                )}>
                  {notification.title}
                </h4>
                <p className={cn(
                  "text-xs leading-relaxed",
                  isDark ? "text-stone-300" : "text-stone-600"
                )}>
                  {notification.content}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <span className={priorityBadge.className}>
                    {priorityBadge.label}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }

    // center position - 现代化更新日志风格
    return (
      <div 
        ref={dragRef}
        className={cn(
          "absolute max-w-lg rounded-2xl shadow-2xl border backdrop-blur-sm cursor-move z-[1000]",
          isDark ? "bg-stone-800/95 border-stone-600" : "bg-white/95 border-stone-200",
          isDragging ? "cursor-grabbing shadow-3xl" : "cursor-grab"
        )}
        style={{ 
          left: `${position.x}%`, 
          top: `${position.y}%`,
          transform: 'translate(-50%, -50%)'
        }}
        onMouseDown={handleMouseDown}
      >
        <div className="p-6">
          {/* 头部区域 */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={cn("p-3 rounded-xl", typeStyles.bg)}>
                <span className={typeStyles.color}>
                  {typeStyles.icon}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn("text-sm font-medium", typeStyles.color)}>
                    {typeStyles.label}
                  </span>
                  <span className={priorityBadge.className}>
                    {priorityBadge.label}
                  </span>
                </div>
                <h3 className={cn(
                  "text-lg font-bold",
                  isDark ? "text-stone-100" : "text-stone-900"
                )}>
                  {notification.title}
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Move className={cn(
                "h-4 w-4",
                isDark ? "text-stone-500" : "text-stone-400"
              )} />
              <button className={cn(
                "p-2 rounded-full hover:bg-stone-500/10 transition-colors",
                isDark ? "text-stone-400" : "text-stone-500"
              )}>
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* 内容区域 */}
          <div className="mb-6">
            <p className={cn(
              "text-sm leading-relaxed",
              isDark ? "text-stone-300" : "text-stone-700"
            )}>
              {notification.content}
            </p>
          </div>

          {/* 元信息 */}
          <div className={cn(
            "flex items-center gap-4 text-xs mb-6 pb-6 border-b",
            isDark ? "text-stone-400 border-stone-600" : "text-stone-500 border-stone-200"
          )}>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{notification.startDate}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>
                {notification.targetAudience === 'all' ? '所有用户' : 
                 notification.targetAudience === 'new_users' ? '新用户' : '回访用户'}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span>
                {notification.position === 'center' ? '中央' :
                 notification.position === 'top-center' ? '顶部' : '右下'}
              </span>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center justify-between">
            <button className={cn(
              "text-xs px-3 py-1.5 rounded-lg transition-colors",
              isDark ? "text-stone-400 hover:text-stone-300" : "text-stone-500 hover:text-stone-600"
            )}>
              查看详情
            </button>
            <div className="flex gap-2">
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
                typeStyles.color,
                typeStyles.bg
              )}>
                知道了
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={containerRef}
      className={cn(
        "h-full w-full relative overflow-hidden",
        isDark ? "bg-stone-900" : "bg-stone-50"
      )}
    >
      {/* --- BEGIN COMMENT ---
      模拟完整页面背景 - 参考About预览的结构
      --- END COMMENT --- */}
      <div className="h-full w-full">
        {/* 模拟导航栏 */}
        <div className={cn(
          "h-16 border-b flex items-center px-6",
          isDark ? "bg-stone-800 border-stone-600" : "bg-white border-stone-200"
        )}>
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-8 h-8 rounded-lg",
              isDark ? "bg-stone-700" : "bg-stone-100"
            )} />
            <h1 className={cn(
              "text-lg font-semibold",
              isDark ? "text-stone-100" : "text-stone-900"
            )}>
              AgentifUI
            </h1>
          </div>
        </div>

        {/* 主内容区域 */}
        <div className="h-[calc(100%-4rem)] p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className={cn(
                "text-3xl font-bold mb-4",
                isDark ? "text-stone-100" : "text-stone-900"
              )}>
                欢迎使用 AgentifUI
              </h1>
              <p className={cn(
                "text-lg mb-6",
                isDark ? "text-stone-300" : "text-stone-600"
              )}>
                这是一个完整的页面预览，用于展示通知在实际应用中的显示效果。
              </p>
            </div>

            {/* 模拟内容卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={cn(
                  "p-6 rounded-xl border",
                  isDark ? "bg-stone-800 border-stone-600" : "bg-white border-stone-200"
                )}>
                  <div className={cn(
                    "w-12 h-12 rounded-lg mb-4",
                    isDark ? "bg-stone-700" : "bg-stone-100"
                  )} />
                  <h3 className={cn(
                    "text-lg font-semibold mb-2",
                    isDark ? "text-stone-100" : "text-stone-900"
                  )}>
                    功能模块 {i}
                  </h3>
                  <p className={cn(
                    "text-sm",
                    isDark ? "text-stone-400" : "text-stone-600"
                  )}>
                    这里是一些示例内容，用于展示通知在真实页面环境中的显示效果和层级关系。
                  </p>
                </div>
              ))}
            </div>

            {/* 提示文字 */}
            {notification.position === 'center' && (
              <div className={cn(
                "text-center p-4 rounded-lg border",
                isDark ? "bg-stone-800 border-stone-600 text-stone-400" : "bg-stone-100 border-stone-200 text-stone-600"
              )}>
                <p className="text-sm">
                  💡 中央通知支持拖拽调整位置 • 这是现代化的更新日志风格设计
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- BEGIN COMMENT ---
      渲染通知 (仅在激活时显示)
      --- END COMMENT --- */}
      {notification.isActive && renderModernNotification()}
    </div>
  )
} 