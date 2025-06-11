"use client"

import React from 'react'
import { useTheme } from '@lib/hooks/use-theme'
import { cn } from '@lib/utils'
import { AboutPageConfig } from './about-editor'

interface AboutPreviewProps {
  config: AboutPageConfig
  previewDevice: 'desktop' | 'tablet' | 'mobile'
}

export function AboutPreview({ config, previewDevice }: AboutPreviewProps) {
  const { isDark } = useTheme()

  // --- BEGIN COMMENT ---
  // 根据预览设备类型设置容器样式
  // --- END COMMENT ---
  const getDeviceStyles = () => {
    switch (previewDevice) {
      case 'mobile':
        return "max-w-sm mx-auto"
      case 'tablet':
        return "max-w-2xl mx-auto"
      case 'desktop':
      default:
        return "max-w-6xl mx-auto"
    }
  }

  return (
    <div className={cn(
      "h-full border rounded-lg overflow-auto",
      isDark ? "bg-stone-800 border-stone-600" : "bg-white border-stone-200"
    )}>
      <div className={cn(
        "p-8",
        getDeviceStyles()
      )}>
        {/* --- BEGIN COMMENT ---
        标题和副标题
        --- END COMMENT --- */}
        <div className="text-center mb-16">
          <h1 className={cn(
            "text-5xl font-bold mb-6",
            isDark ? "text-stone-100" : "text-stone-900"
          )}>
            {config.title}
          </h1>
          <p className={cn(
            "text-xl max-w-3xl mx-auto",
            isDark ? "text-stone-400" : "text-stone-600"
          )}>
            {config.subtitle}
          </p>
        </div>

        {/* --- BEGIN COMMENT ---
        使命部分
        --- END COMMENT --- */}
        <div className="mb-16">
          <div className={cn(
            "bg-gradient-to-r p-8 rounded-xl text-center",
            isDark 
              ? "from-stone-700 to-stone-600" 
              : "from-stone-100 to-stone-50"
          )}>
            <h2 className={cn(
              "text-3xl font-bold mb-6",
              isDark ? "text-stone-100" : "text-stone-900"
            )}>
              我们的使命
            </h2>
            <p className={cn(
              "text-lg leading-relaxed max-w-4xl mx-auto",
              isDark ? "text-stone-300" : "text-stone-700"
            )}>
              {config.mission}
            </p>
          </div>
        </div>

        {/* --- BEGIN COMMENT ---
        价值观卡片
        --- END COMMENT --- */}
        <div className="mb-16">
          <h2 className={cn(
            "text-3xl font-bold text-center mb-12",
            isDark ? "text-stone-100" : "text-stone-900"
          )}>
            我们的价值观
          </h2>
          <div className={cn(
            "grid gap-8",
            previewDevice === 'mobile' 
              ? "grid-cols-1" 
              : previewDevice === 'tablet'
              ? "grid-cols-2"
              : "grid-cols-3"
          )}>
            {config.valueCards.map((card, index) => (
              <div
                key={card.id}
                className={cn(
                  "p-6 rounded-xl border hover:shadow-lg transition-all duration-300",
                  isDark 
                    ? "bg-stone-700 border-stone-600 hover:bg-stone-650" 
                    : "bg-white border-stone-200 hover:shadow-xl"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-lg flex items-center justify-center mb-4",
                  isDark ? "bg-stone-600" : "bg-stone-100"
                )}>
                  <span className={cn(
                    "text-lg font-bold",
                    isDark ? "text-stone-100" : "text-stone-900"
                  )}>
                    {index + 1}
                  </span>
                </div>
                <h3 className={cn(
                  "text-xl font-bold mb-3",
                  isDark ? "text-stone-100" : "text-stone-900"
                )}>
                  {card.title}
                </h3>
                <p className={cn(
                  "leading-relaxed",
                  isDark ? "text-stone-300" : "text-stone-600"
                )}>
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* --- BEGIN COMMENT ---
        行动呼吁按钮
        --- END COMMENT --- */}
        <div className="text-center mb-16">
          <button className={cn(
            "px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300",
            isDark 
              ? "bg-stone-100 text-stone-900 hover:bg-white" 
              : "bg-stone-900 text-white hover:bg-stone-800"
          )}>
            {config.buttonText}
          </button>
        </div>

        {/* --- BEGIN COMMENT ---
        页脚版权信息
        --- END COMMENT --- */}
        <div className={cn(
          "text-center pt-8 border-t",
          isDark ? "border-stone-600" : "border-stone-200"
        )}>
          <p className={cn(
            "text-sm",
            isDark ? "text-stone-400" : "text-stone-500"
          )}>
            {config.copyrightText}
          </p>
        </div>
      </div>
    </div>
  )
} 