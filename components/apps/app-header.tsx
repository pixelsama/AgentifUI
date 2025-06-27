"use client"

import { Package } from "lucide-react"
import { cn } from "@lib/utils"
import { useThemeColors } from "@lib/hooks/use-theme-colors"
import { useTranslations } from 'next-intl'

interface AppHeaderProps {
  totalApps: number
  filteredApps: number
  selectedCategory: string
}

export function AppHeader({ totalApps, filteredApps, selectedCategory }: AppHeaderProps) {
  const { colors, isDark } = useThemeColors()
  const t = useTranslations('pages.apps.market')

  return (
    <div className="mb-6">
      {/* 主标题区域 */}
      <div className="flex items-center gap-3 mb-2">
        <div className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center",
          "bg-gradient-to-br from-blue-500 to-purple-600"
        )}>
          <Package className="w-4 h-4 text-white" />
        </div>
        
        <div>
          <h1 className={cn(
            "text-2xl font-bold font-serif",
            colors.mainText.tailwind
          )}>
            {t('header.title')}
          </h1>
        </div>
      </div>

      {/* 简洁的统计信息 */}
      <div className={cn(
        "text-sm font-serif flex items-center gap-4",
        isDark ? "text-stone-400" : "text-stone-600"
      )}>
        <span>
          {selectedCategory === t('categoryKeys.all')
            ? t('header.totalApps', { count: totalApps })
            : t('header.categoryApps', { category: selectedCategory, count: filteredApps })
          }
        </span>
        {selectedCategory !== t('categoryKeys.all') && filteredApps !== totalApps && (
          <span className={cn(
            "text-xs px-2 py-0.5 rounded",
            isDark ? "bg-stone-800 text-stone-400" : "bg-stone-100 text-stone-600"
          )}>
            {t('header.totalLabel', { count: totalApps })}
          </span>
        )}
      </div>
    </div>
  )
} 