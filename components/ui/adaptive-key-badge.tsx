"use client"

import React from 'react'
import { cn } from '@lib/utils'

interface AdaptiveKeyBadgeProps {
  /** 按键文字 */
  keyText: string
  /** 尺寸模式 */
  size?: 'sm' | 'md'
  /** 是否为暗色主题 */
  isDark?: boolean
  /** 额外的CSS类名 */
  className?: string
}

/**
 * 自适应快捷键徽章组件
 * 
 * 特点：
 * - 根据按键文字长度自动调整容器宽度
 * - 短文字（1-2字符）使用固定正方形
 * - 长文字（3+字符）使用自适应宽度 + 内边距
 * - 保持视觉一致性和可读性
 * - 优化垂直居中对齐
 */
export function AdaptiveKeyBadge({
  keyText,
  size = 'md',
  isDark = false,
  className
}: AdaptiveKeyBadgeProps) {
  const isLongText = keyText.length > 2
  
  // 基础样式 - 添加垂直居中优化
  const baseClasses = cn(
    "inline-flex items-center justify-center",
    "font-medium rounded border select-none",
    "transition-all duration-75",
    // --- 垂直居中优化 ---
    "leading-none", // 明确设置行高为1，避免默认行高影响
    "font-sans", // 使用无衬线字体确保更好的小尺寸渲染
  )
  
  // 尺寸配置
  const sizeConfig = {
    sm: {
      height: "h-3",
      fontSize: "text-[10px]",
      fixedWidth: "w-3",
      adaptiveWidth: "min-w-[18px] px-1",
      shadow: "0 0.5px 1px rgba(0, 0, 0, 0.2)"
    },
    md: {
      height: "h-4", 
      fontSize: "text-xs",
      fixedWidth: "w-4",
      adaptiveWidth: "min-w-[28px] px-1.5",
      shadow: "0 1px 2px rgba(0, 0, 0, 0.1)"
    }
  }
  
  const config = sizeConfig[size]
  
  // 主题样式 - 与sidebar样式一致
  const themeClasses = size === 'sm' 
    ? "bg-black/10 text-white/70 border-white/10"  // Tooltip样式
    : isDark 
      ? "bg-stone-800/90 text-stone-200 border-stone-500/60 shadow-sm backdrop-blur-sm"
      : "bg-white/90 text-stone-700 border-stone-300/70 shadow-sm backdrop-blur-sm"
  
  // 宽度样式
  const widthClasses = isLongText ? config.adaptiveWidth : config.fixedWidth
  
  return (
    <span 
      className={cn(
        baseClasses,
        config.height,
        config.fontSize,
        widthClasses,
        themeClasses,
        className
      )}
      style={{
        // --- 内联样式优化垂直居中 ---
        ...(size === 'sm' ? { boxShadow: config.shadow } : {}),
        fontSizeAdjust: 'none', // 禁用字体大小调整，避免影响垂直对齐
        textAlign: 'center',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        lineHeight: '1', // 强制行高为1
      }}
    >
      {keyText}
    </span>
  )
}

/**
 * 快捷键组合显示组件
 */
interface KeyCombinationProps {
  /** 按键数组 */
  keys: string[]
  /** 尺寸模式 */
  size?: 'sm' | 'md'
  /** 是否为暗色主题 */
  isDark?: boolean
  /** 额外的CSS类名 */
  className?: string
}

export function KeyCombination({
  keys,
  size = 'md',
  isDark = false,
  className
}: KeyCombinationProps) {
  const gapClass = size === 'sm' ? 'gap-0.5' : 'gap-1'
  
  return (
    <div className={cn("flex items-center", gapClass, className)}>
      {keys.map((key, index) => (
        <AdaptiveKeyBadge
          key={index}
          keyText={key}
          size={size}
          isDark={isDark}
        />
      ))}
    </div>
  )
} 