'use client';

import { ConfirmDialog, InputDialog } from '@components/ui';
// 🎯 新增：导入完整对话列表hook，用于查找历史对话
import { useAllConversations } from '@lib/hooks/use-all-conversations';
// 导入聊天接口Hook以获取对话关联的应用ID
import { useChatInterface } from '@lib/hooks/use-chat-interface';
import {
  CombinedConversation,
  conversationEvents,
  useCombinedConversations,
} from '@lib/hooks/use-combined-conversations';
import { useTheme } from '@lib/hooks/use-theme';
import { useAppListStore } from '@lib/stores/app-list-store';
import { useChatStore } from '@lib/stores/chat-store';
import { useFavoriteAppsStore } from '@lib/stores/favorite-apps-store';
import { useSidebarStore } from '@lib/stores/sidebar-store';
import { cn } from '@lib/utils';
import {
  Blocks,
  ChevronDown,
  ChevronUp,
  Edit,
  Heart,
  Pen,
  Star,
  Trash,
} from 'lucide-react';

import React, { useEffect, useMemo, useState } from 'react';

import { useTranslations } from 'next-intl';
import { useParams, usePathname, useRouter } from 'next/navigation';

interface ConversationTitleButtonProps {
  className?: string;
}

export function ConversationTitleButton({
  className,
}: ConversationTitleButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const { currentConversationId } = useChatStore();
  const { isExpanded, selectItem } = useSidebarStore();
  const { conversations, refresh } = useCombinedConversations();
  const t = useTranslations('navbar.conversation');
  // 🎯 新增：获取完整对话列表，用于查找历史对话标题
  const { conversations: allConversations } = useAllConversations();
  const { isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isOperating, setIsOperating] = useState(false);

  // 应用相关状态
  const { apps } = useAppListStore();
  const { favoriteApps, addFavoriteApp, removeFavoriteApp, isFavorite } =
    useFavoriteAppsStore();

  // 获取对话关联的应用ID，用于显示应用名称标签
  const { conversationAppId } = useChatInterface();

  // 模态框状态管理
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // 检查是否为历史对话页面：必须是 /chat/[conversationId] 格式，且不是 /chat/new
  const isHistoricalChatPage = React.useMemo(() => {
    if (!pathname) return false;

    const chatMatch = pathname.match(/^\/chat\/(.+)$/);
    if (!chatMatch) return false;

    const conversationId = chatMatch[1];
    // 排除 /chat/new 页面
    return conversationId !== 'new' && conversationId !== 'history';
  }, [pathname]);

  // 检查是否为应用详情页面：/apps/{type}/[instanceId] 格式
  const isAppDetailPage =
    pathname &&
    pathname.startsWith('/apps/') &&
    pathname.split('/').length === 4;

  // 获取当前应用信息（仅在应用详情页面）
  const currentApp = useMemo(() => {
    if (!isAppDetailPage || !params.instanceId) return null;
    return apps.find(app => app.instance_id === params.instanceId);
  }, [isAppDetailPage, params.instanceId, apps]);

  // 🎯 修复：直接使用与sidebar相同的数据源，移除复杂的备用机制
  // 这样确保导航栏能正确显示打字机效果和实时标题更新
  const currentConversation = React.useMemo(() => {
    if (!currentConversationId) return null;

    // 直接从Combined Conversations中查找，与sidebar保持一致
    return (
      conversations.find(
        conv =>
          conv.id === currentConversationId ||
          conv.external_id === currentConversationId
      ) || null
    );
  }, [conversations, currentConversationId]);

  // 🎯 新增：当combinedConversations找不到对话时，从完整对话列表中查找
  // 这样确保从history页面点击历史对话时能瞬间显示正确标题
  const fallbackConversation = React.useMemo(() => {
    if (currentConversation || !currentConversationId) return null;

    // 从完整对话列表中查找历史对话
    const found = allConversations.find(
      conv =>
        conv.external_id === currentConversationId ||
        conv.id === currentConversationId
    );

    if (found) {
      // 转换为CombinedConversation格式
      return {
        id: found.external_id || found.id,
        title: found.title,
        user_id: found.user_id,
        created_at: found.created_at,
        updated_at: found.updated_at,
        supabase_pk: found.id,
        app_id: found.app_id,
        isPending: false,
      } as CombinedConversation;
    }

    return null;
  }, [currentConversation, currentConversationId, allConversations]);

  // 优先使用combinedConversations中的对话，其次使用fallback对话
  const finalConversation = currentConversation || fallbackConversation;

  // 🎯 新增：获取当前对话关联的应用信息，用于显示应用名称标签
  // 优先使用对话记录中的app_id，其次使用conversationAppId（用于创建中的对话）
  const currentConversationApp = React.useMemo(() => {
    if (!finalConversation && !conversationAppId) return null;

    // 获取应用ID：优先使用对话记录中的app_id，其次使用conversationAppId
    const appId = finalConversation?.app_id || conversationAppId;
    if (!appId) return null;

    // 在应用列表中查找对应的应用
    return (
      apps.find(app => app.instance_id === appId || app.id === appId) || null
    );
  }, [finalConversation, conversationAppId, apps]);

  // 🎯 支持打字机效果的标题显示，与sidebar逻辑保持一致
  // 🎯 修复：当finalConversation为空但conversationAppId存在时，显示"创建中..."
  const getDisplayTitle = () => {
    // 🎯 新增：处理对话创建中的状态
    if (!finalConversation) {
      return conversationAppId ? t('creating') : t('newChat');
    }

    // 检查是否需要显示打字机效果
    if (finalConversation.isPending && finalConversation.titleTypewriterState) {
      const typewriterState = finalConversation.titleTypewriterState;

      // 如果正在打字，显示当前打字进度
      if (typewriterState.isTyping) {
        return (
          typewriterState.displayTitle ||
          finalConversation.title ||
          t('newChat')
        );
      }

      // 如果打字完成，显示目标标题
      if (typewriterState.targetTitle) {
        return typewriterState.targetTitle;
      }
    }

    // 默认显示对话标题
    return finalConversation.title || t('newChat');
  };

  const conversationTitle = getDisplayTitle();

  // 移除动态隐藏策略，现在使用简单的点击模式
  const shouldHide = false;

  // 处理重命名功能 - 使用InputDialog组件
  const handleRename = () => {
    setIsOpen(false);
    setShowRenameDialog(true);
  };

  const handleRenameConfirm = async (newTitle: string) => {
    if (!currentConversationId || !finalConversation) {
      alert(t('createInProgress'));
      setShowRenameDialog(false);
      return;
    }

    const supabasePK = finalConversation?.supabase_pk;
    if (!supabasePK) {
      alert(t('incompleteInfo'));
      setShowRenameDialog(false);
      return;
    }

    setIsOperating(true);
    try {
      const { renameConversation } = await import('@lib/db/conversations');
      const result = await renameConversation(supabasePK, newTitle.trim());

      if (result.success) {
        // 重命名成功后更新页面标题
        const baseTitle = 'AgentifUI';
        // 标题管理由DynamicTitle组件统一处理，无需手动设置

        // 标题更新后会通过refresh()和conversationEvents.emit()自动同步

        // 刷新对话列表
        refresh();
        // 触发全局同步事件，通知所有组件数据已更新
        conversationEvents.emit();
        setShowRenameDialog(false);
      } else {
        console.error('重命名对话失败:', result.error);
        alert(t('renameFailed'));
      }
    } catch (error) {
      console.error('重命名对话操作出错:', error);
      alert(t('operationError'));
    } finally {
      setIsOperating(false);
    }
  };

  // 处理删除功能 - 使用ConfirmDialog组件
  const handleDelete = () => {
    setIsOpen(false);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!currentConversationId || !finalConversation) {
      alert(t('createInProgress'));
      setShowDeleteDialog(false);
      return;
    }

    const supabasePK = finalConversation?.supabase_pk;
    if (!supabasePK) {
      alert(t('incompleteInfo'));
      setShowDeleteDialog(false);
      return;
    }

    setIsOperating(true);
    try {
      const { deleteConversation } = await import('@lib/db/conversations');
      const result = await deleteConversation(supabasePK);

      if (result.success) {
        // 删除成功后跳转到新对话页面 - 与sidebar逻辑一致
        // 触发全局同步事件，通知所有组件数据已更新
        conversationEvents.emit();
        window.location.href = '/chat/new';
      } else {
        console.error('删除对话失败:', result.error);
        alert(t('deleteFailed'));
      }
    } catch (error) {
      console.error('删除对话操作出错:', error);
      alert(t('operationError'));
    } finally {
      setIsOperating(false);
      setShowDeleteDialog(false);
    }
  };

  // 处理应用收藏操作（应用详情页面使用）
  const handleToggleFavorite = async () => {
    if (!currentApp) return;

    try {
      const instanceId = currentApp.instance_id;
      const appMetadata = currentApp.config?.app_metadata;

      if (isFavorite(instanceId)) {
        removeFavoriteApp(instanceId);
      } else {
        await addFavoriteApp({
          instanceId: currentApp.instance_id,
          displayName: currentApp.display_name || currentApp.instance_id,
          description: appMetadata?.brief_description || currentApp.description,
          iconUrl: appMetadata?.icon_url,
          appType: appMetadata?.app_type || 'marketplace',
          dify_apptype: appMetadata?.dify_apptype,
        });

        // 收藏成功后，更新sidebar的选中状态，确保常用应用列表中显示为选中
        selectItem('app', instanceId, true);
      }
    } catch (error) {
      console.error('收藏操作失败:', error);
    }
  };

  // 条件渲染：在历史对话页面显示对话标题，在应用详情页面显示应用信息
  if (isAppDetailPage && currentApp) {
    // 应用详情页面渲染
    const appMetadata = currentApp.config?.app_metadata;
    const instanceId = currentApp.instance_id;

    return (
      <div
        className={cn(
          'flex items-center gap-3 transition-all duration-300 ease-in-out',
          shouldHide
            ? 'pointer-events-none -translate-x-2 opacity-0'
            : 'translate-x-0 opacity-100',
          className
        )}
      >
        {/* 应用信息 */}
        <div className="min-w-0 flex-1">
          <h1
            className={cn(
              'truncate font-serif text-sm font-medium',
              isDark ? 'text-stone-100' : 'text-stone-900'
            )}
          >
            {currentApp.display_name || currentApp.instance_id}
          </h1>
          {appMetadata?.brief_description && (
            <p
              className={cn(
                'truncate font-serif text-xs',
                isDark ? 'text-stone-400' : 'text-stone-600'
              )}
            >
              {appMetadata.brief_description}
            </p>
          )}
        </div>

        {/* 标签 */}
        {appMetadata?.tags && appMetadata.tags.length > 0 && (
          <div className="hidden flex-shrink-0 gap-1 lg:flex">
            {appMetadata.tags.slice(0, 2).map((tag: string, index: number) => (
              <span
                key={index}
                className={cn(
                  'rounded-full px-2 py-0.5 font-serif text-xs',
                  isDark
                    ? 'bg-stone-700 text-stone-300'
                    : 'bg-stone-200 text-stone-700'
                )}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* 收藏按钮 */}
        <button
          onClick={handleToggleFavorite}
          className={cn(
            'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full',
            'transition-all duration-200',
            'hover:scale-110',
            isFavorite(instanceId)
              ? [
                  'bg-red-100 text-red-500',
                  isDark && 'bg-red-900/30 text-red-400',
                ]
              : [
                  'bg-stone-100 text-stone-400 hover:bg-stone-200',
                  isDark && 'bg-stone-800 text-stone-500 hover:bg-stone-700',
                ]
          )}
        >
          <Heart
            className={cn(
              'h-3 w-3 transition-transform',
              isFavorite(instanceId) && 'scale-110 fill-current'
            )}
          />
        </button>

        {/* 应用市场按钮 */}
        <button
          onClick={() => router.push('/apps')}
          className={cn(
            'flex-shrink-0 rounded-md px-2 py-1 font-serif text-xs transition-colors',
            isDark
              ? 'text-stone-400 hover:bg-stone-700 hover:text-stone-200'
              : 'text-stone-600 hover:bg-stone-200 hover:text-stone-900'
          )}
        >
          {t('appsMarket')}
        </button>
      </div>
    );
  }

  // 历史对话页面渲染：只在历史对话页面且有当前对话ID时显示
  // 🎯 修复：当conversationAppId存在时（对话创建中），即使finalConversation为空也应该显示
  if (
    !isHistoricalChatPage ||
    !currentConversationId ||
    (!finalConversation && !conversationAppId)
  ) {
    return null;
  }

  return (
    <>
      <div
        className={cn(
          'relative flex items-center gap-2 transition-all duration-300 ease-in-out',
          // 动态隐藏策略：悬停时透明度降为0并稍微向左移动
          shouldHide
            ? 'pointer-events-none -translate-x-2 opacity-0'
            : 'translate-x-0 opacity-100',
          className
        )}
      >
        {/* --- BEGIN COMMENT ---
        主按钮：优化样式，移除左侧图标，添加cursor控制逻辑
        --- END COMMENT --- */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={isOperating || !finalConversation}
          className={cn(
            'flex items-center space-x-1 rounded-md px-2 py-1 font-serif text-sm',
            'transition-all duration-200 ease-in-out',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'h-8 min-h-[2rem]',
            // --- BEGIN MODIFIED COMMENT ---
            // cursor控制：只有在下拉框关闭且未操作且对话已存在时显示pointer
            // --- END MODIFIED COMMENT ---
            !isOpen && !isOperating && finalConversation
              ? 'cursor-pointer'
              : '',
            isDark
              ? 'text-stone-300 hover:bg-stone-700/50 hover:shadow-sm hover:shadow-stone-800/20 active:bg-stone-600/50'
              : 'text-stone-600 hover:bg-stone-200/80 hover:shadow-sm hover:shadow-stone-300/50 active:bg-stone-300/50'
          )}
        >
          {/* --- BEGIN MODIFIED COMMENT ---
          对话标题：显示标题文本，只在操作时显示loading状态
          --- END MODIFIED COMMENT --- */}
          <span
            className={cn(
              'font-serif whitespace-nowrap',
              'flex items-center leading-none'
            )}
          >
            {isOperating ? (
              <>
                <div
                  className={cn(
                    'mr-2 inline-block h-3 w-3 animate-pulse rounded-full',
                    isDark ? 'bg-stone-500' : 'bg-stone-400'
                  )}
                />
                {t('loading')}
              </>
            ) : (
              conversationTitle
            )}
          </span>

          {/* --- BEGIN COMMENT ---
          右侧图标区域：显示v/反v
          --- END COMMENT --- */}
          <div className="flex h-4 w-4 flex-shrink-0 items-center justify-center">
            {isOpen ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </div>
        </button>

        {/* --- BEGIN COMMENT ---
        🎯 修改：应用名称标签移到按钮外部，避免悬停时一起被选中
        --- END COMMENT --- */}
        {currentConversationApp && (
          <span
            className={cn(
              'flex-shrink-0 rounded-full px-2 py-0.5 font-serif text-xs',
              'transition-colors duration-200',
              isDark
                ? 'border border-stone-600/50 bg-stone-700/80 text-stone-300'
                : 'border border-stone-300/50 bg-stone-200/80 text-stone-700'
            )}
          >
            {currentConversationApp.display_name ||
              currentConversationApp.instance_id}
          </span>
        )}

        {/* --- BEGIN COMMENT ---
        下拉菜单：完全模仿app-selector的样式
        --- END COMMENT --- */}
        {isOpen && (
          <>
            {/* 背景遮罩 */}
            <div
              className="fixed inset-0 z-[90]"
              onClick={() => setIsOpen(false)}
            />

            {/* --- BEGIN MODIFIED COMMENT ---
            下拉选项：改为左侧对齐，避免与sidebar冲突，缩小横向宽度
            --- END MODIFIED COMMENT --- */}
            <div
              className={cn(
                'absolute top-full left-0 mt-1 max-w-[12rem] min-w-[8rem]',
                'z-[95] overflow-hidden rounded-md shadow-lg',
                'border',
                isDark
                  ? 'border-stone-600/80 bg-stone-700/95 backdrop-blur-sm'
                  : 'border-stone-300/80 bg-stone-50/95 backdrop-blur-sm'
              )}
            >
              {/* 重命名选项 */}
              <button
                onClick={handleRename}
                disabled={isOperating}
                className={cn(
                  'w-full px-4 py-3 text-left font-serif text-sm',
                  'whitespace-nowrap transition-colors duration-150',
                  'flex items-center space-x-2',
                  'disabled:cursor-not-allowed disabled:opacity-50',
                  // --- BEGIN MODIFIED COMMENT ---
                  // 添加cursor pointer控制
                  // --- END MODIFIED COMMENT ---
                  !isOperating ? 'cursor-pointer' : '',
                  isDark
                    ? 'text-stone-300 hover:bg-stone-600/60'
                    : 'text-stone-600 hover:bg-stone-200/60'
                )}
              >
                <Pen className="h-4 w-4 flex-shrink-0" />
                <span>{t('rename')}</span>
              </button>

              {/* 删除选项 */}
              <button
                onClick={handleDelete}
                disabled={isOperating}
                className={cn(
                  'w-full px-4 py-3 text-left font-serif text-sm',
                  'whitespace-nowrap transition-colors duration-150',
                  'flex items-center space-x-2',
                  'disabled:cursor-not-allowed disabled:opacity-50',
                  // --- BEGIN MODIFIED COMMENT ---
                  // 添加cursor pointer控制
                  // --- END MODIFIED COMMENT ---
                  !isOperating ? 'cursor-pointer' : '',
                  'mb-1',
                  isDark
                    ? 'text-red-400 hover:bg-red-900/30 hover:text-red-300'
                    : 'text-red-600 hover:bg-red-50 hover:text-red-700'
                )}
              >
                <Trash className="h-4 w-4 flex-shrink-0" />
                <span>{t('delete')}</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* --- BEGIN COMMENT ---
      重命名对话框
      --- END COMMENT --- */}
      <InputDialog
        isOpen={showRenameDialog}
        onClose={() => !isOperating && setShowRenameDialog(false)}
        onConfirm={handleRenameConfirm}
        title={t('renameDialog.title')}
        label={t('renameDialog.title')}
        placeholder={t('renameDialog.placeholder')}
        defaultValue={conversationTitle}
        confirmText={t('renameDialog.confirmText')}
        isLoading={isOperating}
        maxLength={50}
      />

      {/* --- BEGIN COMMENT ---
      删除确认对话框
      --- END COMMENT --- */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => !isOperating && setShowDeleteDialog(false)}
        onConfirm={handleDeleteConfirm}
        title={t('deleteDialog.title')}
        message={t('deleteDialog.message', { title: conversationTitle })}
        confirmText={t('deleteDialog.confirmText')}
        variant="danger"
        icon="delete"
        isLoading={isOperating}
      />
    </>
  );
}
