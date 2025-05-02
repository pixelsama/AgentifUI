"use client"

import React, { useState, useRef, useEffect } from "react"
import { cn } from "@lib/utils"
import { useTheme } from "@lib/hooks/use-theme"
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
  const { activeTooltipId, showTooltip, hideTooltip } = useTooltipStore()
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const triggerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const showTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  const isVisible = activeTooltipId === id
  
  const calculatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return
    
    const triggerRect = triggerRef.current.getBoundingClientRect()
    const tooltipRect = tooltipRef.current.getBoundingClientRect()
    
    let top = 0
    let left = 0
    
    switch (placement) {
      case "top":
        top = triggerRect.top - tooltipRect.height - 8
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2
        break
      case "bottom":
        top = triggerRect.bottom + 8
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2
        break
      case "left":
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2
        left = triggerRect.left - tooltipRect.width - 8
        break
      case "right":
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2
        left = triggerRect.right + 8
        break
    }
    
    // 边界检查，确保tooltip不会超出视窗
    if (left < 10) left = 10
    if (left + tooltipRect.width > window.innerWidth - 10) {
      left = window.innerWidth - tooltipRect.width - 10
    }
    if (top < 10) top = 10
    if (top + tooltipRect.height > window.innerHeight - 10) {
      top = window.innerHeight - tooltipRect.height - 10
    }
    
    setPosition({ top, left })
  }
  
  const handleMouseEnter = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current)
      hideTimeoutRef.current = null
    }
    
    showTimeoutRef.current = setTimeout(() => {
      showTooltip(id)
      setTimeout(calculatePosition, 10) // 确保DOM更新后再计算位置
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
  
  // 在窗口大小变化时重新计算位置
  useEffect(() => {
    const handleResize = () => {
      if (isVisible) calculatePosition()
    }
    
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
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
    switch (placement) {
      case "top":
        return {
          bottom: "-4px",
          left: "calc(50% - 4px)",
          borderLeft: "4px solid transparent",
          borderRight: "4px solid transparent",
          borderTop: `4px solid ${isDark ? 'rgba(31, 41, 55, 0.95)' : 'rgba(249, 250, 251, 0.95)'}`
        }
      case "bottom":
        return {
          top: "-4px",
          left: "calc(50% - 4px)",
          borderLeft: "4px solid transparent",
          borderRight: "4px solid transparent",
          borderBottom: `4px solid ${isDark ? 'rgba(31, 41, 55, 0.95)' : 'rgba(249, 250, 251, 0.95)'}`
        }
      case "left":
        return {
          right: "-4px",
          top: "calc(50% - 4px)",
          borderTop: "4px solid transparent",
          borderBottom: "4px solid transparent",
          borderLeft: `4px solid ${isDark ? 'rgba(31, 41, 55, 0.95)' : 'rgba(249, 250, 251, 0.95)'}`
        }
      case "right":
        return {
          left: "-4px",
          top: "calc(50% - 4px)",
          borderTop: "4px solid transparent",
          borderBottom: "4px solid transparent",
          borderRight: `4px solid ${isDark ? 'rgba(31, 41, 55, 0.95)' : 'rgba(249, 250, 251, 0.95)'}`
        }
    }
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
      
      {isVisible && (
        <div
          ref={tooltipRef}
          className="fixed z-50 animate-fade-in"
          style={{ top: position.top, left: position.left }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div 
            className={cn(
              "relative px-2 py-1 rounded text-sm",
              isDark 
                ? "bg-gray-800/95 text-gray-100 shadow-lg" 
                : "bg-gray-50/95 text-gray-800 shadow-md border border-gray-200/50",
              className
            )}
          >
            {content}
            <div 
              className="absolute h-0 w-0"
              style={getArrowStyle()}
            />
          </div>
        </div>
      )}
    </>
  )
} 