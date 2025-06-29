'use client';

// NavBar 已移至根布局，无需导入
import { WorkflowLayout } from '@components/workflow/workflow-layout';
import { useCurrentApp } from '@lib/hooks/use-current-app';
import { useThemeColors } from '@lib/hooks/use-theme-colors';
import { useAppListStore } from '@lib/stores/app-list-store';
import { useSidebarStore } from '@lib/stores/sidebar-store';
import { cn } from '@lib/utils';
import { Blocks, Loader2 } from 'lucide-react';

import React, { useCallback, useEffect, useState } from 'react';

import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';

interface WorkflowPageProps {
  params: Promise<{
    instanceId: string;
  }>;
}

/**
 * 工作流应用页面
 *
 * 功能特点：
 * - 基于 SSE 的实时工作流执行
 * - 动态输入表单（基于 user_input_form 配置）
 * - 细粒度节点状态跟踪
 * - 执行历史记录管理
 * - 响应式设计，支持移动端
 * - 统一 stone 色系主题
 * - 完整的应用初始化和动态标题支持
 */
export default function WorkflowPage({ params }: WorkflowPageProps) {
  const { instanceId } = React.use(params);
  const router = useRouter();
  const pathname = usePathname();
  const { colors, isDark } = useThemeColors();
  const t = useTranslations('pages.apps');

  // --- 应用相关状态 ---
  const { apps, fetchApps } = useAppListStore();
  const {
    currentAppId,
    isValidating,
    switchToSpecificApp,
    error: appError,
  } = useCurrentApp();
  const { selectItem } = useSidebarStore();

  // --- 应用初始化状态 ---
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);

  // --- 获取当前应用实例数据 ---
  const currentApp = apps.find(app => app.instance_id === instanceId);

  // --- 页面初始化：切换到目标应用并同步sidebar选中状态 ---
  useEffect(() => {
    const initializeApp = async () => {
      if (!instanceId) return;

      try {
        setInitError(null);

        console.log('[工作流页面] 开始初始化应用:', instanceId);

        const needsAppListFetch = apps.length === 0;
        const currentAppMatches = currentAppId === instanceId;

        // 如果应用列表为空，需要获取
        if (needsAppListFetch) {
          setIsInitializing(true);
          console.log('[工作流页面] 应用列表为空，开始获取');
          await fetchApps();
        }

        // 重新获取最新的应用列表
        const latestApps = useAppListStore.getState().apps;
        console.log('[工作流页面] 当前应用列表长度:', latestApps.length);

        // 检查应用是否存在
        const targetApp = latestApps.find(
          app => app.instance_id === instanceId
        );
        if (!targetApp) {
          console.error('[工作流页面] 应用不存在:', instanceId);
          setInitError(t('errors.appNotFound'));
          return;
        }

        console.log('[工作流页面] 找到目标应用:', targetApp.display_name);

        // 立即设置sidebar选中状态
        selectItem('app', instanceId);

        // 只有在当前应用确实不匹配时才进行切换
        if (!currentAppMatches) {
          console.log(
            '[工作流页面] 需要切换应用，从',
            currentAppId,
            '到',
            instanceId
          );

          try {
            await switchToSpecificApp(instanceId);
            console.log('[工作流页面] 应用切换成功');
          } catch (switchError) {
            console.warn(
              '[工作流页面] 应用切换失败，但继续加载页面:',
              switchError
            );
          }
        } else {
          console.log('[工作流页面] 当前应用已匹配，无需切换');
        }

        console.log('[工作流页面] 应用初始化完成');
      } catch (error) {
        console.error('[工作流页面] 初始化失败:', error);
        setInitError(
          error instanceof Error
            ? error.message
            : t('errors.initializationFailed')
        );
      } finally {
        setIsInitializing(false);
      }
    };

    if (instanceId) {
      initializeApp();
    }
  }, [
    instanceId,
    apps.length,
    currentAppId,
    fetchApps,
    switchToSpecificApp,
    selectItem,
    t,
  ]);

  // --- 页面卸载时清除选中状态 ---
  useEffect(() => {
    return () => {
      const currentPath = window.location.pathname;
      if (!currentPath.startsWith('/apps/')) {
        selectItem(null, null);
      }
    };
  }, [selectItem]);

  // --- 错误状态 ---
  if (initError) {
    return (
      <div
        className={cn(
          'relative flex h-full w-full flex-col',
          colors.mainBackground.tailwind,
          'items-center justify-center'
        )}
      >
        <div className="text-center">
          <Blocks
            className={cn(
              'mx-auto mb-4 h-16 w-16',
              isDark ? 'text-stone-400' : 'text-stone-500'
            )}
          />
          <h2
            className={cn(
              'mb-2 font-serif text-xl font-semibold',
              isDark ? 'text-stone-300' : 'text-stone-700'
            )}
          >
            {t('errors.appLoadFailed')}
          </h2>
          <p
            className={cn(
              'mb-4 font-serif',
              isDark ? 'text-stone-400' : 'text-stone-500'
            )}
          >
            {initError}
          </p>
          <button
            onClick={() => router.push('/apps')}
            className={cn(
              'rounded-lg px-4 py-2 font-serif transition-colors',
              isDark
                ? 'bg-stone-700 text-stone-200 hover:bg-stone-600'
                : 'bg-stone-200 text-stone-800 hover:bg-stone-300'
            )}
          >
            {t('buttons.backToMarket')}
          </button>
        </div>
      </div>
    );
  }

  // --- 加载状态 ---
  if (isInitializing || isValidating || !currentApp) {
    return (
      <div
        className={cn(
          'relative flex h-full w-full flex-col',
          colors.mainBackground.tailwind,
          'items-center justify-center'
        )}
      >
        <div className="text-center">
          <Loader2
            className={cn(
              'mx-auto mb-4 h-8 w-8 animate-spin',
              isDark ? 'text-stone-400' : 'text-stone-500'
            )}
          />
          <p
            className={cn(
              'font-serif',
              isDark ? 'text-stone-400' : 'text-stone-500'
            )}
          >
            {isInitializing
              ? t('status.loadingApp')
              : isValidating
                ? t('status.validatingConfig')
                : t('status.loading')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative h-screen w-full overflow-hidden',
        colors.mainBackground.tailwind,
        colors.mainText.tailwind
      )}
    >
      {/* 🎯 NavBar 已移至根布局，无需重复渲染 */}

      {/* --- 主内容区域，为 NavBar 留出空间 --- */}
      <div className="h-full overflow-hidden pt-12">
        <WorkflowLayout instanceId={instanceId} />
      </div>
    </div>
  );
}
