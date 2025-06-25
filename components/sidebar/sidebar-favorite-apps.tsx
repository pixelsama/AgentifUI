"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Zap, Bot, Plus, HeartOff, Heart, Edit, ChevronDown, ChevronRight } from "lucide-react"
import { cn } from "@lib/utils"
import { useCurrentApp } from "@lib/hooks/use-current-app"
import { useChatStore } from "@lib/stores/chat-store"
import { useSidebarStore } from "@lib/stores/sidebar-store"
import { useFavoriteAppsStore } from "@lib/stores/favorite-apps-store"
import { useThemeColors } from "@lib/hooks/use-theme-colors"
import { SidebarListButton } from "./sidebar-list-button"
import { MoreButtonV2 } from "@components/ui/more-button-v2"
import { DropdownMenuV2 } from "@components/ui/dropdown-menu-v2"
import React from "react"

interface FavoriteApp {
  instanceId: string
  displayName: string
  description?: string
  iconUrl?: string
  appType: 'model' | 'marketplace'
  dify_apptype?: 'agent' | 'chatbot' | 'text-generation' | 'chatflow' | 'workflow'
}

interface SidebarFavoriteAppsProps {
  isDark: boolean
  contentVisible: boolean
}

export function SidebarFavoriteApps({ isDark, contentVisible }: SidebarFavoriteAppsProps) {
  const router = useRouter()
  const { switchToSpecificApp } = useCurrentApp()
  const { clearMessages } = useChatStore()
  const { isExpanded, selectItem, selectedType, selectedId } = useSidebarStore()
  const { colors } = useThemeColors()
  const {
    favoriteApps,
    removeFavoriteApp,
    loadFavoriteApps,
    isLoading,
    // --- BEGIN COMMENT ---
    // 🎯 新增：展开/关闭状态管理
    // --- END COMMENT ---
    isExpanded: isAppsExpanded,
    toggleExpanded
  } = useFavoriteAppsStore()

  // 下拉菜单状态管理
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null)

  // 新增：点击状态管理，提供即时反馈
  const [clickingAppId, setClickingAppId] = useState<string | null>(null)

  useEffect(() => {
    loadFavoriteApps()
  }, [loadFavoriteApps])

  // 监听sidebar展开状态，关闭时自动关闭dropdown
  useEffect(() => {
    if (!isExpanded && openDropdownId) {
      setOpenDropdownId(null)
    }
  }, [isExpanded, openDropdownId])

  // --- BEGIN COMMENT ---
  // 根据展开状态决定显示数量：关闭时显示3个，展开时显示所有
  // --- END COMMENT ---
  const displayApps = isAppsExpanded 
    ? favoriteApps 
    : favoriteApps.slice(0, 3)

  // 判断应用是否处于选中状态 - 参考chat list的实现
  const isAppActive = React.useCallback((app: FavoriteApp) => {
    // 获取当前路由路径
    const pathname = window.location.pathname

    // 检查当前路由是否是应用详情页面
    if (!pathname.startsWith('/apps/')) return false

    // 🎯 修复：支持新的路由结构 /apps/{type}/[instanceId]
    const pathParts = pathname.split('/apps/')[1]?.split('/')
    if (!pathParts || pathParts.length < 2) return false
    
    const routeAppType = pathParts[0]  // 应用类型
    const routeInstanceId = pathParts[1]  // 实例ID
    
    // 基本的instanceId匹配
    if (routeInstanceId !== app.instanceId) return false
    
    // 检查应用类型是否匹配
    const appDifyType = app.dify_apptype || 'chatflow'
    return routeAppType === appDifyType
  }, [])

  // 🎯 重构：优化点击处理逻辑，解决用户体验问题
  // 1. 立即跳转路由，让页面级spinner处理加载状态
  // 2. 移除按钮级加载状态，避免按钮卡住
  // 3. 简化应用切换逻辑，避免验证反弹
  // 4. 保持sidebar选中状态的即时反馈
  const handleAppClick = async (app: FavoriteApp) => {
    // 🎯 防止重复点击
    if (clickingAppId === app.instanceId) {
      console.log('[FavoriteApps] 防止重复点击:', app.instanceId)
      return
    }

    try {
      // 🎯 立即设置点击状态，提供短暂的视觉反馈
      setClickingAppId(app.instanceId)
      console.log('[FavoriteApps] 开始切换到常用应用:', app.displayName)

      // 🎯 立即设置sidebar选中状态，提供即时反馈
      selectItem('app', app.instanceId)

      // 🎯 立即跳转路由，让页面级spinner接管加载状态
      const difyAppType = app.dify_apptype || 'chatflow'
      const targetPath = `/apps/${difyAppType}/${app.instanceId}`
      
      console.log('[FavoriteApps] 立即跳转路由:', targetPath)
      
      // 🎯 关键优化：立即跳转，不等待任何异步操作
      // 页面级的加载逻辑会处理应用切换
      router.push(targetPath)
      
      // 🎯 后台静默切换应用，不阻塞UI
      // 如果失败，页面会通过自己的逻辑处理
      switchToSpecificApp(app.instanceId).catch(error => {
        console.warn('[FavoriteApps] 后台应用切换失败，页面将自行处理:', error)
      })
      
      console.log('[FavoriteApps] 路由跳转已发起，页面接管后续处理')

    } catch (error) {
      console.error('[FavoriteApps] 切换到常用应用失败:', error)
      
      // 🎯 错误处理：恢复sidebar状态
      selectItem(null, null)
    } finally {
      // 🎯 快速清除点击状态，避免按钮卡住
      // 使用短延迟确保用户能看到点击反馈
      setTimeout(() => {
        setClickingAppId(null)
      }, 200)
    }
  }

  // 🎯 优化：发起新对话使用相同的优化策略
  const handleStartNewChat = async (app: FavoriteApp) => {
    // 防止重复点击
    if (clickingAppId === app.instanceId) {
      return
    }

    try {
      setClickingAppId(app.instanceId)
      console.log('[FavoriteApps] 发起新对话:', app.displayName)

      // 立即设置sidebar选中状态
      selectItem('app', app.instanceId)

      // 立即跳转，让页面处理后续逻辑
      const difyAppType = app.dify_apptype || 'chatflow'
      const targetPath = `/apps/${difyAppType}/${app.instanceId}`
      
      console.log('[FavoriteApps] 发起新对话，跳转到:', targetPath)
      router.push(targetPath)
      
      // 后台处理应用切换
      switchToSpecificApp(app.instanceId).catch(error => {
        console.warn('[FavoriteApps] 发起新对话时应用切换失败，页面将处理:', error)
      })

    } catch (error) {
      console.error('[FavoriteApps] 发起新对话失败:', error)
      selectItem(null, null)
    } finally {
      setTimeout(() => {
        setClickingAppId(null)
      }, 200)
    }
  }

  // 隐藏应用
  const handleHideApp = (app: FavoriteApp) => {
    removeFavoriteApp(app.instanceId)
  }

  // 获取应用图标
  const getAppIcon = (app: FavoriteApp) => {
    if (app.iconUrl) {
      return (
        <img
          src={app.iconUrl}
          alt={app.displayName}
          className="w-4 h-4 rounded-sm object-cover"
        />
      )
    }
    
    // 🎨 现代化设计：使用彩色渐变背景 + 简洁图标
    // 基于应用ID生成一致的渐变色彩，确保每个应用都有独特且稳定的视觉标识
    // 提升sidebar的现代感和视觉层次
    const getAppGradient = () => {
      const gradients = [
        "bg-gradient-to-br from-blue-400 to-blue-600",
        "bg-gradient-to-br from-purple-400 to-purple-600", 
        "bg-gradient-to-br from-pink-400 to-pink-600",
        "bg-gradient-to-br from-green-400 to-green-600",
        "bg-gradient-to-br from-orange-400 to-orange-600",
        "bg-gradient-to-br from-teal-400 to-teal-600",
        "bg-gradient-to-br from-indigo-400 to-indigo-600",
        "bg-gradient-to-br from-cyan-400 to-cyan-600"
      ]
      
      // 基于应用ID生成一致的哈希值，确保相同应用总是显示相同颜色
      const hash = app.instanceId.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0)
        return a & a
      }, 0)
      
      return gradients[Math.abs(hash) % gradients.length]
    }
    
    return (
      <div className={cn(
        "w-4 h-4 rounded-md flex items-center justify-center text-white shadow-sm",
        "transition-all duration-200 group-hover:scale-105",
        getAppGradient()
      )}>
        {/* 使用简洁的几何图标，现代且通用 */}
        <div className="w-2 h-2 rounded-sm bg-white/90" />
      </div>
    )
  }

  // 创建下拉菜单
  const createMoreActions = (app: FavoriteApp) => {
    const isMenuOpen = openDropdownId === app.instanceId
    // 🎯 检查当前应用是否正在处理中
    const isAppBusy = clickingAppId === app.instanceId

    const handleMenuOpenChange = (isOpen: boolean) => {
      // 🎯 如果应用正在处理中，不允许打开菜单
      if (isAppBusy && isOpen) {
        return
      }
      setOpenDropdownId(isOpen ? app.instanceId : null)
    }

    return (
      <DropdownMenuV2
        placement="bottom"
        minWidth={120}
        isOpen={isMenuOpen}
        onOpenChange={handleMenuOpenChange}
        trigger={
          <MoreButtonV2
            aria-label="更多选项"
            disabled={isAppBusy} // 🎯 应用忙碌时禁用
            isMenuOpen={isMenuOpen}
            isItemSelected={false}
            disableHover={!!openDropdownId && !isMenuOpen}
          />
        }
      >
        <DropdownMenuV2.Item
          icon={<Edit className="w-3.5 h-3.5" />}
          onClick={() => {
            // 🎯 点击后立即关闭菜单，避免状态冲突
            setOpenDropdownId(null)
            handleStartNewChat(app)
          }}
          disabled={isAppBusy} // 🎯 应用忙碌时禁用
        >
          {/* --- BEGIN COMMENT ---
          根据应用类型显示不同的按钮文本
          --- END COMMENT --- */}
          {app.dify_apptype === 'workflow' ? '开始工作流' : 
           app.dify_apptype === 'text-generation' ? '开始文本生成' : 
           '开始对话'}
        </DropdownMenuV2.Item>
        <DropdownMenuV2.Divider />
        <DropdownMenuV2.Item
          icon={<HeartOff className="w-3.5 h-3.5" />}
          onClick={() => {
            setOpenDropdownId(null)
            handleHideApp(app)
          }}
          disabled={isAppBusy} // 🎯 应用忙碌时禁用
        >
          隐藏该应用
        </DropdownMenuV2.Item>
      </DropdownMenuV2>
    )
  }

  // 如果没有常用应用，不显示任何内容
  if (!isLoading && displayApps.length === 0) {
    return null
  }

  if (!contentVisible) return null

  return (
    <div className="flex flex-col">
      {/* --- BEGIN COMMENT ---
      粘性标题：保持原有样式，只添加粘性定位
      --- END COMMENT --- */}
      {displayApps.length > 0 && (
        <div className={cn(
          "sticky top-0 z-40 px-2 py-1 ml-[6px]",
          // --- BEGIN COMMENT ---
          // 使用与sidebar相同的背景色，确保粘性效果完美，无悬停效果
          // 确保z-index足够高，完全覆盖下方内容，避免透明效果
          // --- END COMMENT ---
          colors.sidebarBackground.tailwind,
          favoriteApps.length > 3 && "cursor-pointer"
        )}
        onClick={favoriteApps.length > 3 ? toggleExpanded : undefined}
        >
          <div className="flex items-center">
            {/* --- BEGIN COMMENT ---
            标题文字和展开按钮紧凑布局：去掉数字组件，按钮紧贴文字
            --- END COMMENT --- */}
            <span className={cn(
              "text-xs font-medium font-serif leading-none",
              isDark ? "text-stone-400" : "text-stone-500"
            )}>
              常用应用
            </span>
            
            {/* --- BEGIN COMMENT ---
            展开按钮：仅在有超过3个应用时显示，紧贴文字
            --- END COMMENT --- */}
            {favoriteApps.length > 3 && (
              <ChevronRight className={cn(
                "w-2.5 h-2.5 ml-0.5 transition-transform duration-200",
                isAppsExpanded && "rotate-90",
                isDark ? "text-stone-400/70" : "text-stone-500/70"
              )} />
            )}
          </div>
        </div>
      )}

      {/* 加载状态 */}
      {isLoading && (
        <div className={cn(
          "px-3 py-1 text-xs font-serif",
          isDark ? "text-gray-500" : "text-gray-400"
        )}>
          加载中...
        </div>
      )}

      {/* --- BEGIN COMMENT ---
      应用列表：添加顶部间距，保持与标题的分离
      --- END COMMENT --- */}
      {displayApps.length > 0 && (
        <div className="space-y-1 px-3 pt-1">
          {displayApps.map((app, index) => {
            // 使用路由判断应用是否被选中
            const isSelected = isAppActive(app)
            // 检查当前应用是否正在点击中
            const isClicking = clickingAppId === app.instanceId
            // 计算是否是扩展项（超过前3个的应用）
            const isExtendedItem = index >= 3
            
            return (
              <div 
                className={cn(
                  "group relative transition-opacity duration-300",
                  // --- BEGIN COMMENT ---
                  // 简单的fade in/out效果
                  // --- END COMMENT ---
                  isExtendedItem && !isAppsExpanded ? "opacity-0 pointer-events-none" : "opacity-100"
                )}
                key={app.instanceId}
              >
                <SidebarListButton
                  icon={getAppIcon(app)}
                  onClick={() => handleAppClick(app)}
                  active={isSelected}
                  isLoading={isClicking} // 🎯 显示点击加载状态
                  hasOpenDropdown={openDropdownId === app.instanceId}
                  disableHover={!!openDropdownId || isClicking} // 🎯 点击时禁用悬停
                  moreActionsTrigger={
                    <div className={cn(
                      "transition-opacity",
                      // 🎯 点击时隐藏more button，避免干扰
                      isClicking
                        ? "opacity-0 pointer-events-none"
                        : openDropdownId === app.instanceId
                          ? "opacity-100" // 当前打开菜单的item，more button保持显示
                          : openDropdownId
                            ? "opacity-0" // 有其他菜单打开时，此item的more button不显示
                            : "opacity-0 group-hover:opacity-100 focus-within:opacity-100" // 正常状态下的悬停显示
                    )}>
                      {createMoreActions(app)}
                    </div>
                  }
                  className={cn(
                    "w-full justify-start font-medium",
                    "transition-all duration-200 ease-in-out",
                    // 🎯 点击时的特殊样式
                    isClicking && "opacity-75 cursor-wait",
                    // --- BEGIN COMMENT ---
                    // 🎨 统一悬停效果：与侧边栏所有区域保持完全一致
                    // 使用与功能按钮相同的 stone-300/stone-600 + shadow
                    // --- END COMMENT ---
                    isDark
                      ? "text-gray-300 hover:text-gray-100 hover:bg-stone-600 hover:shadow-md"
                      : "text-gray-700 hover:text-gray-900 hover:bg-stone-300 hover:shadow-md"
                  )}
                >
                  <div className="flex-1 min-w-0 flex items-center">
                    {/* 应用名称 - 使用与近期对话一致的样式 */}
                    <span className="truncate font-serif text-xs font-medium">
                      {app.displayName}
                    </span>
                    {/* 🎯 新增：点击时显示状态提示 */}
                    {isClicking && (
                      <span className={cn(
                        "ml-2 text-xs opacity-75 font-serif",
                        isDark ? "text-gray-400" : "text-gray-500"
                      )}>
                      </span>
                    )}
                  </div>
                </SidebarListButton>
              </div>
            )
          })}
        </div>
      )}



    </div>
  )
} 