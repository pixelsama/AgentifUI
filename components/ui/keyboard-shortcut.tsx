"use client"

import React from 'react'
import { cn } from '@lib/utils'
import { useTheme } from '@lib/hooks/use-theme'
import { useFormattedShortcut, usePlatformKeys, COMMON_SHORTCUTS } from '@lib/hooks/use-platform-keys'

interface KeyboardShortcutProps {
  /** 预定义的快捷键名称 */
  shortcut?: keyof typeof COMMON_SHORTCUTS
  /** 自定义按键数组 */
  keys?: string[]
  /** 尺寸 */
  size?: 'sm' | 'md' | 'lg'
  /** 是否显示为单行（紧凑模式） */
  inline?: boolean
  /** 额外的CSS类名 */
  className?: string
}

/**
 * 现代化快捷键组件
 * 
 * 特点：
 * - 自动平台检测（Mac显示⌘，Windows显示Ctrl）
 * - 3D键帽效果，类似真实键盘
 * - 支持预定义快捷键和自定义按键
 * - 响应式设计，支持不同尺寸
 * - 支持浅色和深色主题
 * 
 * @example
 * ```tsx
 * // 使用预定义快捷键
 * <KeyboardShortcut shortcut="SAVE_SUBMIT" />
 * 
 * // 使用自定义按键
 * <KeyboardShortcut keys={["Cmd", "K"]} />
 * 
 * // 小尺寸紧凑模式
 * <KeyboardShortcut shortcut="COPY" size="sm" inline />
 * ```
 */
export function KeyboardShortcut({
  shortcut,
  keys: customKeys,
  size = 'md',
  inline = false,
  className
}: KeyboardShortcutProps) {
  const { isDark } = useTheme()
  const platformKeys = usePlatformKeys()
  
  // 获取快捷键数据
  const shortcutData = shortcut ? useFormattedShortcut(shortcut) : null
  const finalKeys = shortcutData?.symbols || (customKeys ? platformKeys.formatShortcutSymbols(customKeys) : [])
  
  // 尺寸配置 - 保持正方形比例，对长文本自适应
  const sizeConfig = {
    sm: {
      container: 'gap-1',
      key: 'px-1 rounded text-xs min-w-[20px] h-[20px]',
      shadow: isDark 
        ? '0 1px 0 0 rgb(41 37 36), 0 2px 4px -1px rgba(0, 0, 0, 0.25)'
        : '0 1px 0 0 rgb(168 162 158), 0 2px 4px -1px rgba(0, 0, 0, 0.12)'
    },
    md: {
      container: 'gap-1.5',
      key: 'px-1.5 rounded-md text-sm min-w-[28px] h-[28px]',
      shadow: isDark 
        ? '0 2px 0 0 rgb(41 37 36), 0 4px 6px -1px rgba(0, 0, 0, 0.3)'
        : '0 2px 0 0 rgb(168 162 158), 0 4px 6px -1px rgba(0, 0, 0, 0.15)'
    },
    lg: {
      container: 'gap-2',
      key: 'px-2 rounded-lg text-base min-w-[36px] h-[36px]',
      shadow: isDark 
        ? '0 3px 0 0 rgb(41 37 36), 0 6px 8px -2px rgba(0, 0, 0, 0.35)'
        : '0 3px 0 0 rgb(168 162 158), 0 6px 8px -2px rgba(0, 0, 0, 0.18)'
    }
  }
  
  const config = sizeConfig[size]
  
  if (!finalKeys.length) {
    return null
  }
  
  return (
    <div 
      className={cn(
        "flex items-center",
        config.container,
        inline ? "inline-flex" : "",
        className
      )}
    >
      {finalKeys.map((symbol, index) => (
        <span
          key={index}
          className={cn(
            "inline-flex items-center justify-center",
            "font-medium select-none",
            "shadow-sm border",
            // 3D效果和交互
            "relative",
            "transform transition-transform duration-75",
            "hover:brightness-105",
            "active:translate-y-0.5 active:shadow-sm",
            config.key,
            // 主题样式
            isDark 
              ? "bg-stone-600 text-stone-200 border-stone-500 shadow-stone-900/30"
              : "bg-stone-100 text-stone-700 border-stone-400 shadow-stone-300/60"
          )}
          style={{
            boxShadow: config.shadow
          }}
        >
          {symbol}
        </span>
      ))}
    </div>
  )
}

/**
 * 快捷键徽章组件（紧凑版本）
 * 适用于按钮内部、工具提示等空间有限的场景
 */
export function KeyboardShortcutBadge({
  shortcut,
  keys: customKeys,
  className
}: Omit<KeyboardShortcutProps, 'size' | 'inline'>) {
  return (
    <KeyboardShortcut
      shortcut={shortcut}
      keys={customKeys}
      size="sm"
      inline
      className={className}
    />
  )
} 