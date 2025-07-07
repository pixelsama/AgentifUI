'use client';

import { DropdownMenuV2 } from '@components/ui/dropdown-menu-v2';
import { MoreButtonV2 } from '@components/ui/more-button-v2';
import { useCurrentApp } from '@lib/hooks/use-current-app';
import { useThemeColors } from '@lib/hooks/use-theme-colors';
import { useChatStore } from '@lib/stores/chat-store';
import { useFavoriteAppsStore } from '@lib/stores/favorite-apps-store';
import { useSidebarStore } from '@lib/stores/sidebar-store';
import { cn } from '@lib/utils';
import {
  Bot,
  ChevronDown,
  ChevronRight,
  Edit,
  Heart,
  HeartOff,
  Pen,
  Plus,
  Trash,
  Zap,
} from 'lucide-react';

import { useEffect, useState } from 'react';
import React from 'react';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

import { SidebarListButton } from './sidebar-list-button';

interface FavoriteApp {
  instanceId: string;
  displayName: string;
  description?: string;
  iconUrl?: string;
  appType: 'model' | 'marketplace';
  dify_apptype?:
    | 'agent'
    | 'chatbot'
    | 'text-generation'
    | 'chatflow'
    | 'workflow';
}

interface SidebarFavoriteAppsProps {
  isDark: boolean;
  contentVisible: boolean;
}

export function SidebarFavoriteApps({
  isDark,
  contentVisible,
}: SidebarFavoriteAppsProps) {
  const router = useRouter();
  const { switchToSpecificApp } = useCurrentApp();
  const { clearMessages } = useChatStore();
  const { isExpanded, selectItem, selectedType, selectedId } =
    useSidebarStore();
  const { colors } = useThemeColors();
  const t = useTranslations('sidebar');
  const {
    favoriteApps,
    removeFavoriteApp,
    loadFavoriteApps,
    isLoading,
    // 🎯 新增：展开/关闭状态管理
    isExpanded: isAppsExpanded,
    toggleExpanded,
  } = useFavoriteAppsStore();

  // 下拉菜单状态管理
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // 新增：点击状态管理，提供即时反馈
  const [clickingAppId, setClickingAppId] = useState<string | null>(null);

  useEffect(() => {
    loadFavoriteApps();
  }, [loadFavoriteApps]);

  // 监听sidebar展开状态，关闭时自动关闭dropdown
  useEffect(() => {
    if (!isExpanded && openDropdownId) {
      setOpenDropdownId(null);
    }
  }, [isExpanded, openDropdownId]);

  // 根据展开状态决定显示数量：关闭时显示3个，展开时显示所有
  const displayApps = isAppsExpanded ? favoriteApps : favoriteApps.slice(0, 3);

  // 判断应用是否处于选中状态 - 参考chat list的实现
  const isAppActive = React.useCallback((app: FavoriteApp) => {
    // 获取当前路由路径
    const pathname = window.location.pathname;

    // 检查当前路由是否是应用详情页面
    if (!pathname.startsWith('/apps/')) return false;

    // 🎯 修复：支持新的路由结构 /apps/{type}/[instanceId]
    const pathParts = pathname.split('/apps/')[1]?.split('/');
    if (!pathParts || pathParts.length < 2) return false;

    const routeAppType = pathParts[0]; // 应用类型
    const routeInstanceId = pathParts[1]; // 实例ID

    // 基本的instanceId匹配
    if (routeInstanceId !== app.instanceId) return false;

    // 检查应用类型是否匹配
    const appDifyType = app.dify_apptype || 'chatflow';
    return routeAppType === appDifyType;
  }, []);

  // 🎯 重构：优化点击处理逻辑，解决用户体验问题
  // 1. 立即跳转路由，让页面级spinner处理加载状态
  // 2. 移除按钮级加载状态，避免按钮卡住
  // 3. 简化应用切换逻辑，避免验证反弹
  // 4. 保持sidebar选中状态的即时反馈
  const handleAppClick = async (app: FavoriteApp) => {
    // 🎯 防止重复点击
    if (clickingAppId === app.instanceId) {
      console.log('[FavoriteApps] 防止重复点击:', app.instanceId);
      return;
    }

    try {
      // 🎯 立即设置点击状态，提供短暂的视觉反馈
      setClickingAppId(app.instanceId);
      console.log('[FavoriteApps] 开始切换到常用应用:', app.displayName);

      // 🎯 立即设置sidebar选中状态，提供即时反馈
      selectItem('app', app.instanceId);

      // 🎯 立即跳转路由，让页面级spinner接管加载状态
      const difyAppType = app.dify_apptype || 'chatflow';
      const targetPath = `/apps/${difyAppType}/${app.instanceId}`;

      console.log('[FavoriteApps] 立即跳转路由:', targetPath);

      // 🎯 修复竞态条件：只跳转路由，让目标页面自己处理应用切换
      // 避免同时调用 switchToSpecificApp 导致的 localStorage 状态闪烁
      // 这与应用市场的行为保持一致
      router.push(targetPath);

      // 🎯 移除后台应用切换调用，避免与目标页面的切换逻辑产生竞态条件

      console.log('[FavoriteApps] 路由跳转已发起，页面接管后续处理');
    } catch (error) {
      console.error('[FavoriteApps] 切换到常用应用失败:', error);

      // 🎯 错误处理：恢复sidebar状态
      selectItem(null, null);
    } finally {
      // 🎯 快速清除点击状态，避免按钮卡住
      // 使用短延迟确保用户能看到点击反馈
      setTimeout(() => {
        setClickingAppId(null);
      }, 200);
    }
  };

  // 🎯 优化：发起新对话使用相同的优化策略
  const handleStartNewChat = async (app: FavoriteApp) => {
    // 防止重复点击
    if (clickingAppId === app.instanceId) {
      return;
    }

    try {
      setClickingAppId(app.instanceId);
      console.log('[FavoriteApps] 发起新对话:', app.displayName);

      // 立即设置sidebar选中状态
      selectItem('app', app.instanceId);

      // 立即跳转，让页面处理后续逻辑
      const difyAppType = app.dify_apptype || 'chatflow';
      const targetPath = `/apps/${difyAppType}/${app.instanceId}`;

      console.log('[FavoriteApps] 发起新对话，跳转到:', targetPath);
      router.push(targetPath);

      // 🎯 移除后台应用切换调用，避免竞态条件
      // 让目标页面自己处理应用切换
    } catch (error) {
      console.error('[FavoriteApps] 发起新对话失败:', error);
      selectItem(null, null);
    } finally {
      setTimeout(() => {
        setClickingAppId(null);
      }, 200);
    }
  };

  // 隐藏应用
  const handleHideApp = (app: FavoriteApp) => {
    removeFavoriteApp(app.instanceId);
  };

  // 获取应用图标
  const getAppIcon = (app: FavoriteApp) => {
    if (app.iconUrl) {
      return (
        <img
          src={app.iconUrl}
          alt={app.displayName}
          className="h-4 w-4 rounded-sm object-cover"
        />
      );
    }

    // 🎨 现代化设计：使用彩色渐变背景 + 简洁图标
    // 基于应用ID生成一致的渐变色彩，确保每个应用都有独特且稳定的视觉标识
    // 提升sidebar的现代感和视觉层次
    const getAppGradient = () => {
      const gradients = [
        'bg-gradient-to-br from-blue-400 to-blue-600',
        'bg-gradient-to-br from-purple-400 to-purple-600',
        'bg-gradient-to-br from-pink-400 to-pink-600',
        'bg-gradient-to-br from-green-400 to-green-600',
        'bg-gradient-to-br from-orange-400 to-orange-600',
        'bg-gradient-to-br from-teal-400 to-teal-600',
        'bg-gradient-to-br from-indigo-400 to-indigo-600',
        'bg-gradient-to-br from-cyan-400 to-cyan-600',
      ];

      // 基于应用ID生成一致的哈希值，确保相同应用总是显示相同颜色
      const hash = app.instanceId.split('').reduce((a, b) => {
        a = (a << 5) - a + b.charCodeAt(0);
        return a & a;
      }, 0);

      return gradients[Math.abs(hash) % gradients.length];
    };

    return (
      <div
        className={cn(
          'flex h-4 w-4 items-center justify-center rounded-md text-white shadow-sm',
          'transition-all duration-200 group-hover:scale-105',
          getAppGradient()
        )}
      >
        {/* 使用简洁的几何图标，现代且通用 */}
        <div className="h-2 w-2 rounded-sm bg-white/90" />
      </div>
    );
  };

  // 创建下拉菜单
  const createMoreActions = (app: FavoriteApp) => {
    const isMenuOpen = openDropdownId === app.instanceId;
    // 🎯 检查当前应用是否正在处理中
    const isAppBusy = clickingAppId === app.instanceId;

    const handleMenuOpenChange = (isOpen: boolean) => {
      // 🎯 如果应用正在处理中，不允许打开菜单
      if (isAppBusy && isOpen) {
        return;
      }
      setOpenDropdownId(isOpen ? app.instanceId : null);
    };

    return (
      <DropdownMenuV2
        placement="bottom"
        minWidth={120}
        isOpen={isMenuOpen}
        onOpenChange={handleMenuOpenChange}
        trigger={
          <MoreButtonV2
            aria-label={t('moreOptions')}
            disabled={isAppBusy} // 🎯 应用忙碌时禁用
            isMenuOpen={isMenuOpen}
            isItemSelected={false}
            disableHover={!!openDropdownId && !isMenuOpen}
          />
        }
      >
        <DropdownMenuV2.Item
          icon={<Edit className="h-3.5 w-3.5" />}
          onClick={() => {
            // 🎯 点击后立即关闭菜单，避免状态冲突
            setOpenDropdownId(null);
            handleStartNewChat(app);
          }}
          disabled={isAppBusy} // 🎯 应用忙碌时禁用
        >
          {/* Show different button text based on application type */}
          {app.dify_apptype === 'workflow'
            ? t('startWorkflow')
            : app.dify_apptype === 'text-generation'
              ? t('startTextGeneration')
              : t('startChat')}
        </DropdownMenuV2.Item>
        <DropdownMenuV2.Item
          icon={<HeartOff className="h-3.5 w-3.5" />}
          onClick={() => {
            setOpenDropdownId(null);
            handleHideApp(app);
          }}
          disabled={isAppBusy} // 🎯 应用忙碌时禁用
        >
          {t('hideApp')}
        </DropdownMenuV2.Item>
      </DropdownMenuV2>
    );
  };

  // 如果没有常用应用，不显示任何内容
  if (!isLoading && displayApps.length === 0) {
    return null;
  }

  if (!contentVisible) return null;

  return (
    <div className="flex flex-col">
      {/* Sticky header: maintain original style, only add sticky positioning */}
      {displayApps.length > 0 && (
        <div
          className={cn(
            'group sticky top-0 z-40 ml-[6px] px-2 py-1',
            // Use same background as sidebar for perfect sticky effect
            // Ensure high z-index to cover content below
            colors.sidebarBackground.tailwind,
            favoriteApps.length > 3 &&
              'cursor-pointer rounded-md transition-all duration-300 ease-out hover:bg-stone-200/40 dark:hover:bg-stone-700/40'
          )}
          onClick={favoriteApps.length > 3 ? toggleExpanded : undefined}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {/* Title text with expand hint */}
              <span
                className={cn(
                  'font-serif text-xs leading-none font-medium',
                  isDark ? 'text-stone-400' : 'text-stone-500'
                )}
              >
                {t('favoriteApps')}
              </span>

              {/* Expand button: only show when there are more than 3 apps */}
              {favoriteApps.length > 3 && (
                <ChevronRight
                  className={cn(
                    'ml-1.5 h-3 w-3 transition-all duration-300 ease-out',
                    'transform-gpu will-change-transform',
                    isAppsExpanded && 'rotate-90',
                    'group-hover:scale-110',
                    isDark ? 'text-stone-400/80' : 'text-stone-500/80'
                  )}
                />
              )}
            </div>

            {/* Animated dots indicator showing there are more apps */}
            {favoriteApps.length > 3 && (
              <div
                className={cn(
                  'flex items-center space-x-1 transition-all duration-300 ease-out',
                  isAppsExpanded
                    ? 'scale-90 opacity-40'
                    : 'opacity-60 group-hover:scale-105 group-hover:opacity-100'
                )}
              >
                <div className="flex space-x-0.5">
                  {[...Array(Math.min(3, favoriteApps.length - 3))].map(
                    (_, i) => (
                      <div
                        key={i}
                        className={cn(
                          'h-1 w-1 rounded-full transition-all duration-300 ease-out',
                          'transform-gpu will-change-transform',
                          !isAppsExpanded && `animation-delay-${i * 100}`,
                          'group-hover:scale-125',
                          isDark ? 'bg-stone-500/60' : 'bg-stone-400/60'
                        )}
                        style={{
                          animationDelay: `${i * 100}ms`,
                        }}
                      />
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div
          className={cn(
            'px-3 py-1 font-serif text-xs',
            isDark ? 'text-gray-500' : 'text-gray-400'
          )}
        >
          {t('loading')}
        </div>
      )}

      {/* App list: add top spacing, maintain separation from title */}
      {displayApps.length > 0 && (
        <div className="space-y-1 px-3 pt-1">
          {displayApps.map((app, index) => {
            // Fix cross-page switching delay: allow sidebar store state to take effect immediately during routing
            // 1. If this app is selected in sidebar store, show as selected immediately (during route transition)
            // 2. If on non-app page and not selected in store, ensure no selected state is shown
            const isInAppPage = window.location.pathname.startsWith('/apps/');
            const isSelectedByStore =
              selectedType === 'app' && selectedId === app.instanceId;
            const isSelected =
              isSelectedByStore || (isInAppPage && isAppActive(app));
            // Check if current app is being clicked
            const isClicking = clickingAppId === app.instanceId;
            // Calculate if this is an extended item (apps beyond the first 3)
            const isExtendedItem = index >= 3;

            return (
              <div
                className={cn(
                  'group relative transition-all duration-300 ease-out',
                  'transform-gpu will-change-transform',
                  // Enhanced animation for extended items
                  isExtendedItem && !isAppsExpanded
                    ? 'pointer-events-none translate-y-[-4px] scale-95 opacity-0'
                    : 'translate-y-0 scale-100 opacity-100',
                  // Staggered animation delay for extended items
                  isExtendedItem &&
                    isAppsExpanded &&
                    `animation-delay-${(index - 3) * 50}`
                )}
                style={{
                  animationDelay:
                    isExtendedItem && isAppsExpanded
                      ? `${(index - 3) * 50}ms`
                      : '0ms',
                }}
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
                    <div
                      className={cn(
                        'transition-opacity',
                        // Hide more button when clicking to avoid interference
                        isClicking
                          ? 'pointer-events-none opacity-0'
                          : openDropdownId === app.instanceId
                            ? 'opacity-100' // 当前打开菜单的item，more button保持显示
                            : openDropdownId
                              ? 'opacity-0' // 有其他菜单打开时，此item的more button不显示
                              : 'opacity-0 group-hover:opacity-100 focus-within:opacity-100' // 正常状态下的悬停显示
                      )}
                    >
                      {createMoreActions(app)}
                    </div>
                  }
                  className={cn(
                    'w-full justify-start font-medium',
                    'transition-all duration-200 ease-in-out',
                    // Special styling when clicking
                    isClicking && 'cursor-wait opacity-75',
                    // Unified hover effect: keep completely consistent with header
                    // Use same stone-300/80 and stone-600/60 as header
                    isDark
                      ? 'text-gray-300 hover:bg-stone-600/60 hover:text-gray-100'
                      : 'text-gray-700 hover:bg-stone-300/80 hover:text-gray-900'
                  )}
                >
                  <div className="flex min-w-0 flex-1 items-center">
                    {/* App name - use consistent styling with recent chats */}
                    <span className="truncate font-serif text-xs font-medium">
                      {app.displayName}
                    </span>
                    {/* Show status hint when clicking */}
                    {isClicking && (
                      <span
                        className={cn(
                          'ml-2 font-serif text-xs opacity-75',
                          isDark ? 'text-gray-400' : 'text-gray-500'
                        )}
                      ></span>
                    )}
                  </div>
                </SidebarListButton>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
