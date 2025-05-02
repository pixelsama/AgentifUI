"use client"

import React, { useRef, useEffect } from "react"
import { cn } from "@lib/utils"
import { useTheme } from "@lib/hooks/use-theme"
import { useDropdownStore } from "@lib/stores/ui/dropdown-store"

interface DropdownItemProps {
  icon?: React.ReactNode
  children: React.ReactNode
  onClick?: () => void
  className?: string
  danger?: boolean
}

function DropdownItem({ 
  icon, 
  children, 
  onClick, 
  className,
  danger = false
}: DropdownItemProps) {
  const { isDark } = useTheme()
  const { closeDropdown } = useDropdownStore()
  
  const handleClick = () => {
    closeDropdown()
    onClick?.()
  }
  
  return (
    <button
      className={cn(
        "w-full text-left px-3 py-2 text-sm flex items-center gap-2 rounded-md",
        "transition-colors duration-150",
        isDark
          ? [
              danger 
                ? "text-red-300 hover:bg-red-900/30" 
                : "text-gray-300 hover:bg-gray-700/50"
            ]
          : [
              danger 
                ? "text-red-600 hover:bg-red-50" 
                : "text-gray-700 hover:bg-gray-100"
            ],
        className
      )}
      onClick={handleClick}
    >
      {icon && <span className="flex-shrink-0 w-4 h-4">{icon}</span>}
      <span className="truncate">{children}</span>
    </button>
  )
}

interface DropdownDividerProps {
  className?: string
}

function DropdownDivider({ className }: DropdownDividerProps) {
  const { isDark } = useTheme()
  
  return (
    <div 
      className={cn(
        "h-px my-1 mx-1",
        isDark ? "bg-gray-700" : "bg-gray-200",
        className
      )}
    />
  )
}

interface DropdownMenuProps {
  id: string
  className?: string
  children: React.ReactNode
  placement?: "top" | "bottom" | "left" | "right"
  minWidth?: number
}

export function DropdownMenu({ 
  id, 
  className, 
  children,
  minWidth = 180
}: DropdownMenuProps) {
  const { isDark } = useTheme()
  const { isOpen, activeDropdownId, position, closeDropdown } = useDropdownStore()
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const isVisible = isOpen && activeDropdownId === id
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        closeDropdown()
      }
    }
    
    if (isVisible) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isVisible, closeDropdown])
  
  // 滚动时关闭下拉菜单
  useEffect(() => {
    const handleScroll = () => {
      if (isVisible) {
        closeDropdown()
      }
    }
    
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [isVisible, closeDropdown])
  
  if (!isVisible || !position) return null
  
  return (
    <div
      ref={dropdownRef}
      className={cn(
        "fixed z-50 animate-fade-in",
        "py-1.5 rounded-lg shadow-lg",
        "overflow-hidden",
        isDark
          ? "bg-gray-800 border border-gray-700"
          : "bg-white border border-gray-200",
        className
      )}
      style={{ 
        top: position.top, 
        left: position.left,
        minWidth: `${minWidth}px`
      }}
    >
      {children}
    </div>
  )
}

DropdownMenu.Item = DropdownItem
DropdownMenu.Divider = DropdownDivider 