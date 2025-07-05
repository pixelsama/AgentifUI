'use client';

import { MobileNavButton } from '@components/mobile';
import { SettingsMobileNav, SettingsSidebar } from '@components/settings';
import { useMobile } from '@lib/hooks';
import { useSettingsColors } from '@lib/hooks/use-settings-colors';
import { useSidebarStore } from '@lib/stores/sidebar-store';
import { cn } from '@lib/utils';

import { useTranslations } from 'next-intl';

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const { isExpanded, isMounted } = useSidebarStore();
  const isMobile = useMobile();
  const { colors, isDark } = useSettingsColors();

  // 🎯 移除重复的 setMounted 调用，现在由全局 ClientLayout 统一管理
  // 计算主内容区域的左边距
  // 仅在桌面端且侧边栏锁定时，根据展开状态设置边距
  // 悬停展开时不设置边距（覆盖模式）
  const getMainMarginLeft = () => {
    if (isMobile) return 'ml-0';
    return isExpanded ? 'ml-64' : 'ml-16';
  };

  return (
    <div
      className={cn('flex h-full min-h-screen', colors.pageBackground.tailwind)}
    >
      {/* 🎯 Sidebar 已移至根布局，无需重复渲染 */}

      {/* 🎯 NavBar 已移至根布局，无需重复渲染 */}

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
            {/* 设置页面内容 */}
            <div className="p-4 md:p-8">{children}</div>
          </div>
        </div>
      </main>
    </div>
  );
}
