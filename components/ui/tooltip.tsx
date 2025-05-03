"use client"

import React, { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom" 
import { cn } from "@lib/utils"
import { useTheme } from "@lib/hooks/use-theme"
import { useMobile } from "@lib/hooks/use-mobile"
import { useTooltipStore } from "@lib/stores/ui/tooltip-store"

type TooltipPlacement = "top" | "bottom" | "left" | "right"

interface TooltipProps {
  children: React.ReactNode
  content: React.ReactNode
  id: string
  placement?: TooltipPlacement
  className?: string
  delayShow?: number
  delayHide?: number
}

// TooltipContainer组件 - 用于渲染所有tooltip的容器
export function TooltipContainer() {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);
  
  if (!isMounted) return null;
  
  return <div id="tooltip-root" className="fixed z-[9999] overflow-hidden pointer-events-none" />;
}

export function Tooltip({
  children,
  content,
  id,
  placement = "top",
  className,
  delayShow = 200,
  delayHide = 100
}: TooltipProps) {
  const { isDark } = useTheme()
  const isMobile = useMobile()
  const { activeTooltipId, showTooltip, hideTooltip } = useTooltipStore()
  const [mounted, setMounted] = useState(false)
  const [tooltipRoot, setTooltipRoot] = useState<HTMLElement | null>(null)
  const triggerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const showTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  const isVisible = activeTooltipId === id

  // 客户端挂载检测和获取tooltip容器
  useEffect(() => {
    setMounted(true)
    // 查找全局tooltip容器
    setTooltipRoot(document.getElementById("tooltip-root"))
    return () => setMounted(false)
  }, [])
  
  const updatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return
    
    const triggerRect = triggerRef.current.getBoundingClientRect()
    const tooltipRect = tooltipRef.current.getBoundingClientRect()
    
    // 计算基于视口的位置
    let top: number
    let left: number
    
    const gap = 8 // 提示框与触发元素之间的间隙
    
    switch (placement) {
      case "top":
        top = triggerRect.top - tooltipRect.height - gap
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2
        break
      case "bottom":
        top = triggerRect.bottom + gap
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2
        break
      case "left":
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2
        left = triggerRect.left - tooltipRect.width - gap
        break
      case "right":
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2
        left = triggerRect.right + gap
        break
      default:
        top = triggerRect.top - tooltipRect.height - gap
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2
    }
    
    // 边界检查，确保tooltip不会超出视窗
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight
    
    // 左侧边界
    if (left < 10) {
      left = 10
    }
    
    // 右侧边界
    if (left + tooltipRect.width > viewportWidth - 10) {
      left = viewportWidth - tooltipRect.width - 10
    }
    
    // 上边界
    if (top < 10) {
      // 如果是顶部位置且超出了，尝试切换到底部位置
      if (placement === "top") {
        top = triggerRect.bottom + gap
      } else {
        top = 10
      }
    }
    
    // 下边界
    if (top + tooltipRect.height > viewportHeight - 10) {
      // 如果是底部位置且超出了，尝试切换到顶部位置
      if (placement === "bottom") {
        top = triggerRect.top - tooltipRect.height - gap
      } else {
        top = viewportHeight - tooltipRect.height - 10
      }
    }
    
    // 应用定位
    if (tooltipRef.current) {
      tooltipRef.current.style.top = `${top}px`
      tooltipRef.current.style.left = `${left}px`
    }
  }
  
  const handleMouseEnter = () => {
    // 在移动设备上不显示tooltip
    if (isMobile) return
    
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current)
      hideTimeoutRef.current = null
    }
    
    showTimeoutRef.current = setTimeout(() => {
      showTooltip(id)
    }, delayShow)
  }
  
  const handleMouseLeave = () => {
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current)
      showTimeoutRef.current = null
    }
    
    hideTimeoutRef.current = setTimeout(() => {
      hideTooltip()
    }, delayHide)
  }
  
  // 在tooltip可见状态变化时更新位置
  useEffect(() => {
    if (isVisible) {
      // 使用RAF确保DOM已经更新
      requestAnimationFrame(() => {
        updatePosition()
      })
    }
  }, [isVisible])
  
  // 监听滚动和调整大小事件
  useEffect(() => {
    if (!isVisible) return
    
    const handleScroll = () => requestAnimationFrame(updatePosition)
    const handleResize = () => requestAnimationFrame(updatePosition)
    
    window.addEventListener('scroll', handleScroll, true)
    window.addEventListener('resize', handleResize)
    
    return () => {
      window.removeEventListener('scroll', handleScroll, true)
      window.removeEventListener('resize', handleResize)
    }
  }, [isVisible])
  
  // 在组件卸载时清除定时器
  useEffect(() => {
    return () => {
      if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current)
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current)
    }
  }, [])
  
  // 计算箭头位置样式
  const getArrowStyle = () => {
    const arrowColor = isDark ? 'rgba(31, 41, 55, 0.95)' : 'rgba(55, 65, 81, 0.95)'; // gray-800 for dark, gray-700 for light
    
    switch (placement) {
      case "top":
        return {
          bottom: "-4px",
          left: "calc(50% - 4px)",
          borderLeft: "4px solid transparent",
          borderRight: "4px solid transparent",
          borderTop: `4px solid ${arrowColor}`
        }
      case "bottom":
        return {
          top: "-4px",
          left: "calc(50% - 4px)",
          borderLeft: "4px solid transparent",
          borderRight: "4px solid transparent",
          borderBottom: `4px solid ${arrowColor}`
        }
      case "left":
        return {
          right: "-4px",
          top: "calc(50% - 4px)",
          borderTop: "4px solid transparent",
          borderBottom: "4px solid transparent",
          borderLeft: `4px solid ${arrowColor}`
        }
      case "right":
        return {
          left: "-4px",
          top: "calc(50% - 4px)",
          borderTop: "4px solid transparent",
          borderBottom: "4px solid transparent",
          borderRight: `4px solid ${arrowColor}`
        }
      default:
        return {}
    }
  }
  
  // 移动设备上不渲染tooltip，只渲染子元素
  if (isMobile) {
    return <>{children}</>
  }
  
  return (
    <>
      <div 
        ref={triggerRef}
        className="inline-block"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>
      
      {mounted && isVisible && tooltipRoot && createPortal(
        <div
          ref={tooltipRef}
          className="fixed z-[9999] animate-fade-in pointer-events-none"
          style={{ top: 0, left: 0 }}
        >
          <div 
            className={cn(
              "relative px-2 py-1 rounded text-sm pointer-events-auto",
              isDark 
                ? "bg-gray-800/95 text-gray-200 shadow-lg" 
                : "bg-gray-700/95 text-gray-100 shadow-md",
              className
            )}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {content}
            <div 
              className="absolute h-0 w-0"
              style={getArrowStyle()}
            />
          </div>
        </div>,
        tooltipRoot
      )}
    </>
  )
} 