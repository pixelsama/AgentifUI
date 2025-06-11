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
  // 根据预览设备类型设置容器样式和尺寸
  // --- END COMMENT ---
  const getDeviceStyles = () => {
    switch (previewDevice) {
      case 'mobile':
        return {
          container: "mx-auto bg-black rounded-[2rem] p-2 shadow-2xl",
          screen: "w-[375px] h-[667px] bg-white rounded-[1.75rem] overflow-hidden relative",
          content: "h-full overflow-y-auto p-4"
        }
      case 'tablet':
        return {
          container: "mx-auto bg-black rounded-xl p-3 shadow-2xl",
          screen: "w-[768px] h-[1024px] bg-white rounded-lg overflow-hidden relative",
          content: "h-full overflow-y-auto p-6"
        }
      case 'desktop':
      default:
        return {
          container: "w-full h-full",
          screen: "w-full h-full bg-white overflow-hidden relative",
          content: "h-full overflow-y-auto p-8"
        }
    }
  }

  const deviceStyles = getDeviceStyles()

  // --- BEGIN COMMENT ---
  // 根据设备调整字体大小
  // --- END COMMENT ---
  const getTextSizes = () => {
    switch (previewDevice) {
      case 'mobile':
        return {
          title: "text-3xl",
          subtitle: "text-base",
          missionTitle: "text-xl",
          missionContent: "text-sm",
          valuesTitle: "text-xl",
          cardTitle: "text-base",
          cardContent: "text-sm",
          button: "text-sm px-6 py-2",
          copyright: "text-xs"
        }
      case 'tablet':
        return {
          title: "text-4xl",
          subtitle: "text-lg",
          missionTitle: "text-2xl",
          missionContent: "text-base",
          valuesTitle: "text-2xl",
          cardTitle: "text-lg",
          cardContent: "text-sm",
          button: "text-base px-7 py-3",
          copyright: "text-xs"
        }
      case 'desktop':
      default:
        return {
          title: "text-5xl",
          subtitle: "text-xl",
          missionTitle: "text-3xl",
          missionContent: "text-lg",
          valuesTitle: "text-3xl",
          cardTitle: "text-xl",
          cardContent: "text-base",
          button: "text-lg px-8 py-4",
          copyright: "text-sm"
        }
    }
  }

  const textSizes = getTextSizes()

  return (
    <div className={cn(
      "h-full flex items-center justify-center p-4",
      isDark ? "bg-stone-900" : "bg-stone-100"
    )}>
      <div className={deviceStyles.container}>
        <div className={cn(
          deviceStyles.screen,
          isDark ? "bg-stone-800" : "bg-white"
        )}>
          <div className={cn(
            deviceStyles.content,
            previewDevice !== 'desktop' && "max-w-none"
          )}>
            {/* --- BEGIN COMMENT ---
            标题和副标题
            --- END COMMENT --- */}
            <div className={cn(
              "text-center",
              previewDevice === 'mobile' ? "mb-8" : previewDevice === 'tablet' ? "mb-12" : "mb-16"
            )}>
              <h1 className={cn(
                textSizes.title,
                "font-bold mb-4",
                isDark ? "text-stone-100" : "text-stone-900"
              )}>
                {config.title}
              </h1>
              <p className={cn(
                textSizes.subtitle,
                "max-w-3xl mx-auto leading-relaxed",
                isDark ? "text-stone-400" : "text-stone-600"
              )}>
                {config.subtitle}
              </p>
            </div>

            {/* --- BEGIN COMMENT ---
            使命部分
            --- END COMMENT --- */}
            <div className={cn(
              previewDevice === 'mobile' ? "mb-8" : previewDevice === 'tablet' ? "mb-12" : "mb-16"
            )}>
              <div className={cn(
                "bg-gradient-to-r rounded-xl text-center",
                previewDevice === 'mobile' ? "p-4" : previewDevice === 'tablet' ? "p-6" : "p-8",
                isDark 
                  ? "from-stone-700 to-stone-600" 
                  : "from-stone-100 to-stone-50"
              )}>
                <h2 className={cn(
                  textSizes.missionTitle,
                  "font-bold mb-4",
                  isDark ? "text-stone-100" : "text-stone-900"
                )}>
                  我们的使命
                </h2>
                <p className={cn(
                  textSizes.missionContent,
                  "leading-relaxed max-w-4xl mx-auto",
                  isDark ? "text-stone-300" : "text-stone-700"
                )}>
                  {config.mission}
                </p>
              </div>
            </div>

            {/* --- BEGIN COMMENT ---
            价值观卡片
            --- END COMMENT --- */}
            <div className={cn(
              previewDevice === 'mobile' ? "mb-8" : previewDevice === 'tablet' ? "mb-12" : "mb-16"
            )}>
              <h2 className={cn(
                textSizes.valuesTitle,
                "font-bold text-center mb-8",
                isDark ? "text-stone-100" : "text-stone-900"
              )}>
                我们的价值观
              </h2>
              <div className={cn(
                "grid gap-4",
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
                      "rounded-xl border hover:shadow-lg transition-all duration-300",
                      previewDevice === 'mobile' ? "p-4" : previewDevice === 'tablet' ? "p-5" : "p-6",
                      isDark 
                        ? "bg-stone-700 border-stone-600 hover:bg-stone-650" 
                        : "bg-white border-stone-200 hover:shadow-xl"
                    )}
                  >
                    <div className={cn(
                      "rounded-lg flex items-center justify-center mb-3",
                      previewDevice === 'mobile' ? "w-8 h-8" : previewDevice === 'tablet' ? "w-10 h-10" : "w-12 h-12",
                      isDark ? "bg-stone-600" : "bg-stone-100"
                    )}>
                      <span className={cn(
                        "font-bold",
                        previewDevice === 'mobile' ? "text-sm" : previewDevice === 'tablet' ? "text-base" : "text-lg",
                        isDark ? "text-stone-100" : "text-stone-900"
                      )}>
                        {index + 1}
                      </span>
                    </div>
                    <h3 className={cn(
                      textSizes.cardTitle,
                      "font-bold mb-2",
                      isDark ? "text-stone-100" : "text-stone-900"
                    )}>
                      {card.title}
                    </h3>
                    <p className={cn(
                      textSizes.cardContent,
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
            <div className={cn(
              "text-center",
              previewDevice === 'mobile' ? "mb-8" : previewDevice === 'tablet' ? "mb-12" : "mb-16"
            )}>
              <button className={cn(
                textSizes.button,
                "rounded-xl font-semibold transition-all duration-300 hover:scale-105",
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
              "text-center pt-6 border-t",
              isDark ? "border-stone-600" : "border-stone-200"
            )}>
              <p className={cn(
                textSizes.copyright,
                isDark ? "text-stone-400" : "text-stone-500"
              )}>
                {config.copyrightText}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 