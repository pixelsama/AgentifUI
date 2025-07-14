'use client';

import { ConfirmDialog, InputDialog } from '@components/ui';
import { DropdownMenuV2 } from '@components/ui/dropdown-menu-v2';
import { MoreButtonV2 } from '@components/ui/more-button-v2';
import { TypeWriter } from '@components/ui/typewriter';
import {
  CombinedConversation,
  conversationEvents,
  useCombinedConversations,
} from '@lib/hooks/use-combined-conversations';
import { useThemeColors } from '@lib/hooks/use-theme-colors';
import { usePendingConversationStore } from '@lib/stores/pending-conversation-store';
import { cn } from '@lib/utils';
import { Pen, Trash } from 'lucide-react';

import * as React from 'react';

import { useTranslations } from 'next-intl';

// 使用新的 SidebarListButton 组件
import { SidebarListButton } from './sidebar-list-button';

interface SidebarChatListProps {
  isDark: boolean;
  contentVisible: boolean;
  selectedId: string | null;
  onSelectChat: (chatId: string) => void;
}

export function SidebarChatList({
  isDark,
  contentVisible,
  selectedId,
  onSelectChat,
}: SidebarChatListProps) {
  const { colors } = useThemeColors();
  const t = useTranslations('sidebar');
  const {
    conversations,
    isLoading: isLoadingConversations,
    refresh,
  } = useCombinedConversations();

  const completeTitleTypewriter = usePendingConversationStore(
    state => state.completeTitleTypewriter
  );

  // Dialog状态管理
  const [showRenameDialog, setShowRenameDialog] = React.useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [isOperating, setIsOperating] = React.useState(false);
  const [selectedConversation, setSelectedConversation] =
    React.useState<CombinedConversation | null>(null);

  // 🎯 新增：下拉菜单状态管理
  // 记录当前打开的下拉菜单对应的对话ID
  const [openDropdownId, setOpenDropdownId] = React.useState<string | null>(
    null
  );

  const [prevLoadedConversations, setPrevLoadedConversations] = React.useState<
    CombinedConversation[]
  >([]);

  // 当对话列表成功加载时，保存当前状态
  React.useEffect(() => {
    if (!isLoadingConversations && conversations.length > 0) {
      setPrevLoadedConversations(conversations);
    }
  }, [isLoadingConversations, conversations]);

  // 🎯 检测对话列表变化，识别被挤出的对话（瞬间消失效果）
  React.useEffect(() => {
    const prevIds = new Set(prevLoadedConversations.map(conv => conv.id));
    const currentIds = new Set(conversations.map(conv => conv.id));

    // 找出在之前列表中存在但在当前列表中不存在的对话ID
    const disappearedIds = Array.from(prevIds).filter(
      id => !currentIds.has(id)
    );

    if (disappearedIds.length > 0) {
      console.log(
        `[SidebarChatList] 🎯 检测到${disappearedIds.length}个对话被挤出:`,
        disappearedIds
      );
      // 瞬间挤出效果：对话直接从列表中消失
    }
  }, [conversations, prevLoadedConversations]);

  // 🎯 显示逻辑：直接显示当前对话列表（瞬间挤出效果）
  const displayConversations = React.useMemo(() => {
    return isLoadingConversations &&
      conversations.length === 0 &&
      prevLoadedConversations.length > 0
      ? prevLoadedConversations
      : conversations;
  }, [isLoadingConversations, conversations, prevLoadedConversations]);

  const unpinnedChats = React.useMemo(() => {
    return displayConversations.filter(chat => !chat.isPending);
  }, [displayConversations]);

  const pendingChats = React.useMemo(() => {
    return displayConversations.filter(chat => chat.isPending === true);
  }, [displayConversations]);

  // 使用数据库中的历史对话，默认已经限制为20个
  // 使用 useSidebarConversations 获取的对话列表已经限制为20个
  const visibleUnpinnedChats = unpinnedChats;

  const handleRename = React.useCallback(
    async (chatId: string) => {
      const conversation = conversations.find(c => c.id === chatId);
      if (!conversation) return;

      setSelectedConversation(conversation);
      setShowRenameDialog(true);
    },
    [conversations]
  );

  const handleRenameConfirm = React.useCallback(
    async (newTitle: string) => {
      if (!selectedConversation) return;

      const supabasePK = selectedConversation.supabase_pk;
      if (!supabasePK) {
        alert(t('syncingMessage'));
        setShowRenameDialog(false);
        return;
      }

      setIsOperating(true);
      try {
        const { renameConversation } = await import('@lib/db/conversations');
        const result = await renameConversation(supabasePK, newTitle.trim());

        if (result.success) {
          // 重命名成功后直接更新页面标题，无需刷新页面
          if (selectedId === selectedConversation.id) {
            // 标题管理由DynamicTitle组件统一处理，无需手动设置
          }

          refresh();
          // 触发全局同步事件，通知所有组件数据已更新
          conversationEvents.emit();
          setShowRenameDialog(false);
        } else {
          console.error('重命名对话失败:', result.error);
          alert(t('operationFailed'));
        }
      } catch (error) {
        console.error('重命名对话操作出错:', error);
        alert(t('operationFailed'));
      } finally {
        setIsOperating(false);
      }
    },
    [selectedConversation, selectedId, refresh]
  );

  const handleDelete = React.useCallback(
    async (chatId: string) => {
      const conversation = conversations.find(c => c.id === chatId);
      if (!conversation) return;

      setSelectedConversation(conversation);
      setShowDeleteDialog(true);
    },
    [conversations]
  );

  const handleDeleteConfirm = React.useCallback(async () => {
    if (!selectedConversation) return;

    const supabasePK = selectedConversation.supabase_pk;
    if (!supabasePK) {
      alert(t('syncingMessage'));
      setShowDeleteDialog(false);
      return;
    }

    setIsOperating(true);
    try {
      const { deleteConversation } = await import('@lib/db/conversations');
      const result = await deleteConversation(supabasePK);

      if (result.success) {
        refresh();
        // 删除对话后直接路由到 /chat/new
        // 触发全局同步事件，通知所有组件数据已更新
        conversationEvents.emit();
        if (selectedId === selectedConversation.id) {
          window.location.href = '/chat/new';
        }
        setShowDeleteDialog(false);
      } else {
        console.error('删除对话失败:', result.error);
        alert(t('operationFailed'));
      }
    } catch (error) {
      console.error('删除对话操作出错:', error);
      alert(t('operationFailed'));
    } finally {
      setIsOperating(false);
    }
  }, [selectedConversation, selectedId, refresh]);

  // 添加辅助函数，判断聊天项是否应该处于选中状态
  // 考虑临时ID和正式ID之间的转换情况
  // 判断聊天项是否处于选中状态
  // 1. 检查当前路由是否是聊天页面
  // 2. 检查ID是否匹配（直接ID或临时ID）
  // 这样可以确保从聊天页面切换到其他页面时，聊天项不会保持选中状态
  const isChatActive = React.useCallback(
    (chat: CombinedConversation) => {
      // 首先检查是否有选中的ID
      if (!selectedId) return false;

      // 获取当前路由路径
      const pathname = window.location.pathname;

      // 检查当前路由是否是聊天页面
      // 当路由以 /chat/ 开头时，才考虑聊天项的选中状态
      // 当路由是 /chat/history 时，不考虑聊天项的选中状态
      if (!pathname.startsWith('/chat/')) return false;
      if (pathname === '/chat/history') return false;

      // 直接ID匹配
      if (chat.id === selectedId) return true;

      // 临时ID匹配（处理从temp-xxx切换到正式ID的情况）
      if (chat.tempId && selectedId.includes(chat.tempId)) return true;

      // 确保不会有误匹配
      return false;
    },
    [selectedId]
  );

  // 🎯 处理侧边栏不可见时的打字机效果
  // 如果侧边栏内容不可见，但有待处理的打字机效果，直接完成它们
  React.useEffect(() => {
    if (!contentVisible) {
      // 查找所有需要打字机效果的对话
      const chatsNeedingTypewriter = pendingChats.filter(
        chat =>
          chat.titleTypewriterState?.shouldStartTyping &&
          chat.titleTypewriterState?.targetTitle
      );

      // 直接完成所有打字机效果
      chatsNeedingTypewriter.forEach(chat => {
        completeTitleTypewriter(chat.id);
      });
    }
  }, [contentVisible, pendingChats, completeTitleTypewriter]);

  if (!contentVisible) return null;

  // 🎯 修改渲染逻辑，集成TypeWriter组件实现打字机效果
  // 使用统一的结构和高度，避免切换时的布局跳动
  // 考虑到右侧 more button 的占位，确保骨架屏宽度适当
  const renderChatItemContent = (
    chat: CombinedConversation,
    isItemLoading: boolean
  ) => {
    const title = chat.title || t('untitled');

    // 🎯 检查是否需要使用打字机效果
    const shouldUseTypewriter =
      chat.isPending &&
      chat.titleTypewriterState?.shouldStartTyping &&
      chat.titleTypewriterState?.targetTitle;

    // 所有状态下使用相同的高度和结构，确保一致性
    return (
      <div className="flex h-4 w-full items-center">
        {' '}
        {/* 增加高度为 h-4，防止字母下降部被裁切 */}
        {isItemLoading ? (
          // 骨架屏 - 宽度设置为 w-[85%]，为右侧 more button 预留空间
          <div
            className={cn(
              'h-4 w-[85%] animate-pulse rounded-md',
              isDark ? 'bg-stone-600' : 'bg-stone-400',
              'opacity-80'
            )}
          />
        ) : shouldUseTypewriter ? (
          // 🎯 使用TypeWriter组件显示打字机效果，包装在h4标签中以应用装饰字体
          <h4
            className={cn(
              'w-full truncate font-serif text-xs leading-4 font-medium',
              isDark ? 'text-gray-200' : 'text-stone-700'
            )}
          >
            <TypeWriter
              text={chat.titleTypewriterState!.targetTitle}
              speed={30} // 较快的打字速度
              delay={200} // 短暂延迟
              className="font-serif text-xs leading-4 font-medium"
              onComplete={() => {
                // 🎯 打字完成后更新store状态
                completeTitleTypewriter(chat.id);
              }}
            />
          </h4>
        ) : (
          // 标题文本 - 使用h4标签以应用装饰字体，与历史对话页面保持一致
          <h4
            className={cn(
              'w-full truncate font-serif text-xs leading-4 font-medium',
              isDark ? 'text-gray-200' : 'text-stone-700'
            )}
          >
            {title}
          </h4>
        )}
      </div>
    );
  };

  // 修改 createMoreActions 函数，确保临时 ID 和真正对话 ID 之间切换时布局保持一致
  // 对于临时 ID 的对话，返回禁用状态的 more button 而不是 null，保持布局一致
  // 优化下拉菜单样式，使其与整体主题更加协调
  // 🎯 新增：集成下拉菜单状态管理，实现解构效果
  const createMoreActions = (
    chat: CombinedConversation,
    itemIsLoading: boolean
  ) => {
    const canPerformActions = !!chat.supabase_pk;
    const isTempChat = !chat.id || chat.id.startsWith('temp-');
    const isMenuOpen = openDropdownId === chat.id;
    const isItemSelected = isChatActive(chat);

    // 🎯 处理下拉菜单状态变化
    const handleMenuOpenChange = (isOpen: boolean) => {
      setOpenDropdownId(isOpen ? chat.id : null);
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
            disabled={itemIsLoading || !canPerformActions || isTempChat}
            isMenuOpen={isMenuOpen}
            disableHover={!!openDropdownId && !isMenuOpen}
            className={cn(
              'transition-opacity',
              itemIsLoading || !canPerformActions || isTempChat
                ? 'opacity-50'
                : ''
            )}
          />
        }
      >
        <DropdownMenuV2.Item
          icon={<Pen className="h-3.5 w-3.5" />}
          onClick={() => handleRename(chat.id)}
          disabled={itemIsLoading || !canPerformActions || isTempChat}
        >
          {t('rename')}
        </DropdownMenuV2.Item>
        <DropdownMenuV2.Item
          icon={<Trash className="h-3.5 w-3.5" />}
          danger
          onClick={() => handleDelete(chat.id)}
          disabled={itemIsLoading || !canPerformActions || isTempChat}
        >
          {t('delete')}
        </DropdownMenuV2.Item>
      </DropdownMenuV2>
    );
  };

  // 🎯 修复：当没有对话时完全隐藏，与常用应用保持一致
  const hasAnyConversations =
    pendingChats.length > 0 || visibleUnpinnedChats.length > 0;

  if (!isLoadingConversations && !hasAnyConversations) {
    return null;
  }

  return (
    <>
      <div className="flex flex-col space-y-1">
        {/* Recent chats sticky header: mimic favorite apps style, add sticky positioning */}
        {/* Fix: only show title when there are conversations to avoid appearing then disappearing */}

        {hasAnyConversations && (
          <div
            className={cn(
              'sticky top-0 z-40 ml-[6px] flex items-center px-2 py-1 font-serif text-xs font-medium',
              // 使用与sidebar相同的背景色，确保粘性效果完美
              // 确保z-index足够高，完全覆盖下方内容
              colors.sidebarBackground.tailwind
            )}
          >
            <span
              className={cn(
                'font-serif text-xs leading-none font-medium',
                isDark ? 'text-stone-400' : 'text-stone-500'
              )}
            >
              {t('recentChats')}
            </span>
          </div>
        )}

        {/* --- 待处理对话列表 --- */}
        {pendingChats.length > 0 && (
          <div className="mb-0.5 pt-1">
            {' '}
            {/* 🟢 修复：mb-1.5 改为 mb-0.5，与内部间距一致 */}
            <div className="space-y-0.5 px-3">
              {' '}
              {/* 减小列表项之间的间距 */}
              {pendingChats.map(chat => {
                const itemIsLoading =
                  chat.pendingStatus === 'creating' ||
                  chat.pendingStatus === 'title_fetching' ||
                  chat.pendingStatus === 'streaming_message';
                // 使用辅助函数判断项目是否应该处于选中状态
                // 处理临时ID和正式ID之间的转换情况
                const isActive = isChatActive(chat);

                return (
                  <div className="group relative" key={chat.tempId || chat.id}>
                    {/* 使用新的 SidebarListButton 替代 SidebarButton */}
                    <SidebarListButton
                      active={isActive}
                      onClick={() => onSelectChat(chat.id)}
                      isLoading={itemIsLoading}
                      hasOpenDropdown={openDropdownId === chat.id}
                      disableHover={!!openDropdownId}
                      moreActionsTrigger={
                        <div
                          className={cn(
                            'transition-opacity',
                            // 🎯 当有菜单打开时，禁用group-hover效果，避免其他item的more button在悬停时显示
                            // 但当前打开菜单的item的more button应该保持显示
                            itemIsLoading
                              ? 'pointer-events-none' // 禁用交互但保持占位
                              : openDropdownId === chat.id
                                ? 'opacity-100' // 当前打开菜单的item，more button保持显示
                                : openDropdownId
                                  ? 'opacity-0' // 有其他菜单打开时，此item的more button不显示
                                  : 'opacity-0 group-hover:opacity-100 focus-within:opacity-100' // 正常状态下的悬停显示
                          )}
                        >
                          {/* 无论是否加载，都显示 more button，确保布局一致 */}
                          {createMoreActions(chat, itemIsLoading)}
                        </div>
                      }
                    >
                      {renderChatItemContent(chat, itemIsLoading)}
                    </SidebarListButton>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* --- 已保存对话列表 --- */}
        <div className="pt-0.5">
          {' '}
          {/* 🟢 修复：pt-1 改为 pt-0.5，与内部间距一致 */}
          <div className="space-y-0.5 px-3">
            {' '}
            {/* 减小列表项之间的间距 */}
            {visibleUnpinnedChats.map(chat => {
              // 使用辅助函数判断项目是否应该处于选中状态
              // 处理已保存对话的选中逻辑，确保精确匹配
              const isActive = isChatActive(chat);
              const itemIsLoading = false;

              return (
                <div className="group relative" key={chat.id}>
                  {/* 使用新的 SidebarListButton 替代 SidebarButton */}
                  <SidebarListButton
                    active={isActive}
                    onClick={() => onSelectChat(chat.id)}
                    isLoading={false}
                    hasOpenDropdown={openDropdownId === chat.id}
                    disableHover={!!openDropdownId}
                    moreActionsTrigger={
                      <div
                        className={cn(
                          'transition-opacity',
                          // 🎯 当有菜单打开时，禁用group-hover效果，避免其他item的more button在悬停时显示
                          // 但当前打开菜单的item的more button应该保持显示
                          openDropdownId === chat.id
                            ? 'opacity-100' // 当前打开菜单的item，more button保持显示
                            : openDropdownId
                              ? 'opacity-0' // 有其他菜单打开时，此item的more button不显示
                              : 'opacity-0 group-hover:opacity-100 focus-within:opacity-100' // 正常状态下的悬停显示
                        )}
                      >
                        {createMoreActions(chat, itemIsLoading)}
                      </div>
                    }
                  >
                    {renderChatItemContent(chat, itemIsLoading)}
                  </SidebarListButton>
                </div>
              );
            })}
            {/* Remove view all history button, moved to Header area */}
          </div>
        </div>
      </div>

      {/* Rename dialog */}
      <InputDialog
        isOpen={showRenameDialog}
        onClose={() => !isOperating && setShowRenameDialog(false)}
        onConfirm={handleRenameConfirm}
        title={t('renameDialog.title')}
        label={t('renameDialog.label')}
        placeholder={t('renameDialog.placeholder')}
        defaultValue={selectedConversation?.title || t('untitled')}
        confirmText={t('renameDialog.confirmText')}
        isLoading={isOperating}
        maxLength={50}
      />

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => !isOperating && setShowDeleteDialog(false)}
        onConfirm={handleDeleteConfirm}
        title={t('deleteDialog.title')}
        message={t('deleteDialog.message', {
          title: selectedConversation?.title || t('untitled'),
        })}
        confirmText={t('deleteDialog.confirmText')}
        variant="danger"
        icon="delete"
        isLoading={isOperating}
      />
    </>
  );
}
