"use client"

import React, { useState } from "react"
import { cn } from "@lib/utils"
import { useTheme } from "@lib/hooks/use-theme"
import { User } from "lucide-react"
import { useMobile } from "@lib/hooks/use-mobile"
import { UserBottomSheet } from "./ui/user-bottom-sheet"
import { useProfile } from "@lib/hooks/use-profile"
import { useSidebarStore } from "@lib/stores/sidebar-store"
import { useTranslations } from "next-intl"

/**
 * 移动端侧边栏用户按钮组件
 * 点击触发底部弹出框
 * 样式与侧边栏其他按钮一致
 */
export function MobileUserButton() {
  const { isDark } = useTheme()
  const isMobile = useMobile()
  const { isExpanded } = useSidebarStore()
  const [isOpen, setIsOpen] = useState(false)
  const t = useTranslations("mobile.user")
  const tNav = useTranslations("mobile.navigation")
  
  // 使用 useProfile hook 获取用户信息
  const { profile } = useProfile()
  
  // 从 profile 中提取用户信息
  const isLoggedIn = !!profile
  const userName = profile?.full_name || profile?.username || (isLoggedIn ? t("defaultUser") : t("loginRegister"))
  const avatarUrl = profile?.avatar_url
  
  // 生成用户头像的首字母
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }
  
  // 根据用户名生成一致的石色系背景颜色
  const getAvatarBgColor = (name: string) => {
    const colors = [
      '#78716c', // stone-500
      '#57534e', // stone-600
      '#44403c', // stone-700
      '#64748b', // slate-500
      '#475569', // slate-600
      '#6b7280', // gray-500
      '#4b5563', // gray-600
      '#737373'  // neutral-500
    ]
    
    let hash = 0
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    return colors[Math.abs(hash) % colors.length]
  }
  
  // 打开底部弹出框
  const handleOpenBottomSheet = () => {
    setIsOpen(true)
  }
  
  // 关闭底部弹出框
  const handleCloseBottomSheet = () => {
    setIsOpen(false)
  }
  
  // 非移动端不显示内容，但保留组件结构确保Hooks正确执行
  if (!isMobile) {
    return null
  }
  
  return (
    <>
      <button
        onClick={handleOpenBottomSheet}
        className={cn(
          "relative flex items-center rounded-lg px-3 py-2 text-sm font-medium w-full",
          "transition-all duration-200 ease-in-out",
          "cursor-pointer outline-none",
          
          // 根据主题和登录状态应用不同样式
          !isDark && [
            "text-stone-600", 
            "hover:bg-stone-300 hover:shadow-md",
            isLoggedIn 
              ? "" 
              : "text-blue-600"
          ],
          
          isDark && [
            "text-gray-200",
            "hover:bg-stone-600 hover:shadow-md",
            isLoggedIn 
              ? "" 
              : "text-blue-400"
          ],
        )}
        aria-label={isLoggedIn ? tNav("openUserMenu") : t("loginRegister")}
      >
        {/* 左侧头像 */}
        <span className="flex h-8 w-8 items-center justify-center">
          {isLoggedIn ? (
            avatarUrl ? (
              <img
                src={avatarUrl}
                alt={t("avatarAlt", { userName })}
                className="w-8 h-8 rounded-full object-cover"
                onError={(e) => {
                  // 头像加载失败时隐藏图片
                  (e.target as HTMLImageElement).style.display = 'none'
                }}
              />
            ) : (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium text-sm"
                style={{
                  backgroundColor: getAvatarBgColor(userName)
                }}
              >
                {getInitials(userName)}
              </div>
            )
          ) : (
            <span className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full",
              "transition-all duration-200 ease-in-out",
              isDark
                ? "bg-blue-600/20 text-blue-400"
                : "bg-blue-500/10 text-blue-600"
            )}>
              <User className="w-4 h-4" />
            </span>
          )}
        </span>

        {/* 右侧文字，只在展开时显示 */}
        {isExpanded && (
          <span className="ml-3 truncate font-serif">
            {isLoggedIn ? userName : t("loginRegister")}
          </span>
        )}
      </button>
      
      <UserBottomSheet 
        isOpen={isOpen}
        onClose={handleCloseBottomSheet}
        isLoggedIn={!!isLoggedIn}
      />
    </>
  )
} 