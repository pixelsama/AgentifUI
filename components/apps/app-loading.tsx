"use client"

import { cn } from "@lib/utils"
import { useThemeColors } from "@lib/hooks/use-theme-colors"
import { useTranslations } from 'next-intl'

export function AppLoading() {
  const { colors, isDark } = useThemeColors()
  const t = useTranslations('loading')

  return (
    <div className={cn(
      "min-h-screen",
      colors.mainBackground.tailwind
    )}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-600"></div>
          <span className={cn(
            "ml-3 font-serif",
            isDark ? "text-stone-400" : "text-stone-600"
          )}>
            {t('appList')}
          </span>
        </div>
      </div>
    </div>
  )
} 