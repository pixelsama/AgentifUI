'use client';

import { MobileNavButton } from '@components/mobile';
import { NavBar } from '@components/nav-bar';
import { SettingsMobileNav } from '@components/settings/settings-mobile-nav';
import { SettingsSidebar } from '@components/settings/settings-sidebar';
import { useMobile } from '@lib/hooks';
import { useSettingsColors } from '@lib/hooks/use-settings-colors';
import { useSidebarStore } from '@lib/stores/sidebar-store';
import { cn } from '@lib/utils';
import { ChevronLeft } from 'lucide-react';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const { isExpanded, isMounted } = useSidebarStore();
  const isMobile = useMobile();
  const { colors, isDark } = useSettingsColors();
  const router = useRouter();
  const t = useTranslations('common.ui');

  // --- BEGIN COMMENT ---
  // 🎯 移除重复的 setMounted 调用，现在由全局 ClientLayout 统一管理
  // --- END COMMENT ---

  // --- BEGIN COMMENT ---
  // 计算主内容区域的左边距
  // 仅在桌面端且侧边栏锁定时，根据展开状态设置边距
  // 悬停展开时不设置边距（覆盖模式）
  // --- END COMMENT ---
  const getMainMarginLeft = () => {
    if (isMobile) return 'ml-0';
    return isExpanded ? 'ml-64' : 'ml-16';
  };

  return (
    <div
      className={cn('flex h-full min-h-screen', colors.pageBackground.tailwind)}
    >
      {/* 🎯 Sidebar 已移至根布局，无需重复渲染 */}

      {/* --- 添加导航栏 --- */}
      <NavBar />

      {/* 
        移动端导航按钮 - 仅在客户端挂载后显示 
      */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        {isMounted && <MobileNavButton />}
      </div>

      {/* 主内容区域 - 分为左侧设置导航和右侧内容 */}
      <main
        className={cn(
          'h-screen w-full overflow-auto',
          getMainMarginLeft(),
          'transition-[margin-left] duration-150 ease-in-out',
          colors.textColor.tailwind,
          // --- 为navbar留出顶部空间 ---
          'pt-12'
        )}
      >
        <div className="flex h-full flex-col md:flex-row">
          {/* 设置侧边导航 - 移动端响应式隐藏，移除分割线保持简洁 */}
          <div
            className={cn(
              'relative z-40 hidden w-64 shrink-0 md:block',
              colors.pageBackground.tailwind
            )}
          >
            <SettingsSidebar />
          </div>

          {/* 移动端设置导航 - 仅在移动端显示 */}
          <div
            className={cn(
              'block p-4 md:hidden',
              colors.pageBackground.tailwind
            )}
          >
            <SettingsMobileNav />
          </div>

          {/* 设置内容区域 */}
          <div className="flex-1 overflow-auto">
            {/* 返回按钮区域 - 使用isDark统一样式 */}
            <div
              className={cn(
                'sticky top-0 z-10 p-4 backdrop-blur-sm md:p-6',
                colors.pageBackground.tailwind
              )}
            >
              <button
                onClick={() => router.back()}
                className={cn(
                  'group flex items-center gap-2 rounded-xl px-3 py-2 transition-all duration-200',
                  'font-serif text-sm font-medium',
                  // --- 使用isDark统一样式 ---
                  isDark
                    ? [
                        'bg-stone-800 hover:bg-stone-700',
                        'text-stone-300 hover:text-stone-100',
                        'border border-stone-700 hover:border-stone-600',
                      ]
                    : [
                        'bg-stone-100 hover:bg-stone-200',
                        'text-stone-700 hover:text-stone-900',
                        'border border-stone-200 hover:border-stone-300',
                      ],
                  'shadow-sm hover:shadow-md',
                  'transform hover:scale-[1.02] active:scale-[0.98]',
                  'focus:ring-2 focus:ring-stone-500 focus:ring-offset-2 focus:outline-none',
                  isDark
                    ? 'focus:ring-offset-stone-900'
                    : 'focus:ring-offset-white'
                )}
              >
                <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                <span className="hidden font-serif sm:inline">{t('back')}</span>
              </button>
            </div>

            {/* 设置页面内容 - 移除分割线，保持简洁 */}
            <div className="p-4 md:p-8">{children}</div>
          </div>
        </div>
      </main>
    </div>
  );
}
