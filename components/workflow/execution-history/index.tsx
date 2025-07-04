'use client';

import { useProfile } from '@lib/hooks/use-profile';
import { useTheme } from '@lib/hooks/use-theme';
import { useThemeColors } from '@lib/hooks/use-theme-colors';
import { useWorkflowExecutionStore } from '@lib/stores/workflow-execution-store';
import type { AppExecution } from '@lib/types/database';
import { cn } from '@lib/utils';
import { Check, History, Loader2, Search, Trash2, X } from 'lucide-react';

import React, { useEffect, useState } from 'react';

import { useTranslations } from 'next-intl';

import { ExecutionItem } from './execution-item';

interface ExecutionHistoryProps {
  instanceId: string;
  onClose: () => void;
  isMobile: boolean;
  onViewResult: (result: any, execution: AppExecution) => void;
}

/**
 * 执行历史记录组件
 *
 * 功能特点：
 * - 显示工作流执行历史
 * - 支持搜索
 * - 可查看历史执行结果
 * - 响应式设计
 * - 动态开门关门效果
 * - 独立滚动容器
 */
export function ExecutionHistory({
  instanceId,
  onClose,
  isMobile,
  onViewResult,
}: ExecutionHistoryProps) {
  const { profile } = useProfile();
  const userId = profile?.id;
  const { colors, isDark } = useThemeColors();
  const t = useTranslations('pages.workflow.history');
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [searchTerm, setSearchTerm] = useState(''); // 保留但不使用

  // --- 多选删除相关状态 ---
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  // --- 查看结果loading状态 ---
  const [loadingExecutionId, setLoadingExecutionId] = useState<string | null>(
    null
  );

  const executionHistory = useWorkflowExecutionStore(
    state => state.executionHistory
  );

  // --- 组件挂载时触发进入动画 ---
  useEffect(() => {
    // 延迟触发动画，确保DOM已渲染
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // --- 处理关闭 ---
  const handleClose = () => {
    // 立即关闭，不使用动画
    onClose();
  };

  // --- 自动刷新历史记录 ---
  useEffect(() => {
    const loadHistory = async () => {
      setIsLoading(true);
      try {
        // 获取正确的应用UUID
        const { useAppListStore } = await import('@lib/stores/app-list-store');
        const currentApps = useAppListStore.getState().apps;
        const targetApp = currentApps.find(
          app => app.instance_id === instanceId
        );

        if (!targetApp) {
          console.warn(
            '[执行历史] 未找到对应的应用记录，instanceId:',
            instanceId
          );
          setIsLoading(false);
          return;
        }

        const { getExecutionsByServiceInstance } = await import(
          '@lib/db/app-executions'
        );

        if (!userId) {
          console.warn('[执行历史] 用户未登录，无法加载历史记录');
          setIsLoading(false);
          return;
        }

        const result = await getExecutionsByServiceInstance(
          targetApp.id,
          userId,
          50
        ); // 🔒 添加用户ID过滤

        if (result.success) {
          console.log('[执行历史] 历史记录加载成功，数量:', result.data.length);
          useWorkflowExecutionStore.getState().setExecutionHistory(result.data);
        } else {
          console.error('[执行历史] 历史记录加载失败:', result.error);
        }
      } catch (error) {
        console.error('[执行历史] 加载历史记录时出错:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadHistory();
  }, [instanceId]);

  // 直接使用所有执行记录，无需筛选
  const displayExecutions = executionHistory;

  // --- 批量删除处理 ---
  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return;

    setIsDeleting(true);
    try {
      console.log('批量删除执行记录:', Array.from(selectedIds));

      // 导入删除函数
      const { deleteExecution } = await import('@lib/db/app-executions');

      // 检查用户登录状态
      if (!userId) {
        console.warn('[执行历史] 用户未登录，无法删除执行记录');
        return;
      }

      // 并行删除所有选中的记录
      const deletePromises = Array.from(selectedIds).map(async id => {
        const result = await deleteExecution(id, userId); // 🔒 添加用户ID过滤
        if (!result.success) {
          console.error(`删除执行记录失败 ${id}:`, result.error);
          return false;
        }
        return true;
      });

      const results = await Promise.all(deletePromises);
      const successCount = results.filter(Boolean).length;
      const failCount = results.length - successCount;

      if (successCount > 0) {
        // 刷新历史记录列表
        await loadHistory();
        console.log(`成功删除 ${successCount} 条记录`);
      }

      if (failCount > 0) {
        console.error(`${failCount} 条记录删除失败`);
      }

      // 清空选中状态
      setSelectedIds(new Set());
      setIsMultiSelectMode(false);
    } catch (error) {
      console.error('批量删除失败:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  // --- 重新加载历史记录 ---
  const loadHistory = async () => {
    try {
      // 获取正确的应用UUID
      const { useAppListStore } = await import('@lib/stores/app-list-store');
      const currentApps = useAppListStore.getState().apps;
      const targetApp = currentApps.find(app => app.instance_id === instanceId);

      if (!targetApp) {
        console.warn(
          '[执行历史] 未找到对应的应用记录，instanceId:',
          instanceId
        );
        return;
      }

      const { getExecutionsByServiceInstance } = await import(
        '@lib/db/app-executions'
      );

      if (!userId) {
        console.warn('[执行历史] 用户未登录，无法刷新历史记录');
        return;
      }

      const result = await getExecutionsByServiceInstance(
        targetApp.id,
        userId,
        50
      ); // 🔒 添加用户ID过滤

      if (result.success) {
        console.log('[执行历史] 历史记录刷新成功，数量:', result.data.length);
        useWorkflowExecutionStore.getState().setExecutionHistory(result.data);
      } else {
        console.error('[执行历史] 历史记录刷新失败:', result.error);
      }
    } catch (error) {
      console.error('[执行历史] 刷新历史记录时出错:', error);
    }
  };

  // --- 点击查看执行详情 ---
  const handleViewExecution = async (execution: AppExecution) => {
    if (isMultiSelectMode) {
      // 多选模式下切换选中状态
      const newSelectedIds = new Set(selectedIds);
      if (newSelectedIds.has(execution.id)) {
        newSelectedIds.delete(execution.id);
      } else {
        newSelectedIds.add(execution.id);
      }
      setSelectedIds(newSelectedIds);
    } else {
      // 正常模式下查看执行详情
      try {
        // 设置loading状态
        setLoadingExecutionId(execution.id);

        // 从数据库获取完整的执行详情
        console.log('正在获取执行详情:', execution.id);

        const { getExecutionById } = await import('@lib/db/app-executions');

        if (!userId) {
          console.warn('[执行历史] 用户未登录，无法获取执行详情');
          // 显示错误结果
          const errorResult = {
            error: t('getDetailFailed'),
            message: '用户未登录',
            status: 'error',
          };
          onViewResult(errorResult, execution);
          return;
        }

        const result = await getExecutionById(execution.id, userId); // 🔒 添加用户ID过滤

        if (result.success && result.data) {
          const fullExecution = result.data;

          // 使用获取到的完整数据
          let executionResult = fullExecution.outputs;

          // 如果没有outputs，创建一个包含基本信息的结果对象
          if (!executionResult || Object.keys(executionResult).length === 0) {
            executionResult = {
              message: t('noDetailData'),
              status: fullExecution.status,
              executionId: fullExecution.id,
              title: fullExecution.title,
              inputs: fullExecution.inputs,
              createdAt: fullExecution.created_at,
              completedAt: fullExecution.completed_at,
              elapsedTime: fullExecution.elapsed_time,
              totalSteps: fullExecution.total_steps,
              totalTokens: fullExecution.total_tokens,
              errorMessage: fullExecution.error_message,
            };
          }

          // 调用父组件的回调函数
          onViewResult(executionResult, fullExecution);
        } else {
          // 显示错误结果
          const errorResult = {
            error: t('getDetailFailed'),
            message: result.error?.message || t('unknownError'),
            status: 'error',
          };
          onViewResult(errorResult, execution);
        }
      } catch (error) {
        console.error('获取执行详情失败:', error);
        // 显示错误结果
        const errorResult = {
          error: t('getDetailFailed'),
          message: error instanceof Error ? error.message : t('unknownError'),
          status: 'error',
        };
        onViewResult(errorResult, execution);
      } finally {
        // 清除loading状态
        setLoadingExecutionId(null);
      }
    }
  };

  return (
    <div
      className={cn(
        'relative flex h-full flex-col overflow-hidden',
        // --- 使用与页面一致的背景色 ---
        isDark ? 'bg-stone-950' : 'bg-stone-50',
        // --- 动画效果 ---
        'transition-all duration-300 ease-in-out',
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0',
        isClosing && 'translate-x-full opacity-0'
      )}
    >
      {/* --- 主要内容：使用 absolute 定位填满容器 --- */}
      <div className="absolute inset-0 z-10 flex flex-col">
        {/* 头部 */}
        <div
          className={cn(
            'flex-shrink-0 border-b p-3',
            isDark ? 'border-stone-700/50' : 'border-stone-300/50',
            // --- 头部动画：从上方滑入 ---
            'transition-all delay-100 duration-300 ease-out',
            isVisible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History
                className={cn(
                  'h-4 w-4 transition-transform duration-300',
                  isDark ? 'text-stone-400' : 'text-stone-600',
                  isVisible ? 'rotate-0' : 'rotate-180'
                )}
              />
              <h2
                className={cn(
                  'font-serif text-base font-semibold',
                  colors.mainText.tailwind
                )}
              >
                {t('title')}
              </h2>
              {/* 选中计数 */}
              {isMultiSelectMode && selectedIds.size > 0 && (
                <span
                  className={cn(
                    'rounded-md px-2 py-1 font-serif text-sm',
                    isDark
                      ? 'bg-stone-700 text-stone-300'
                      : 'bg-stone-100 text-stone-600'
                  )}
                >
                  {t('selected', { count: selectedIds.size })}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* 多选模式按钮 */}
              {!isMultiSelectMode ? (
                <button
                  onClick={() => setIsMultiSelectMode(true)}
                  className={cn(
                    'rounded-md p-1.5 transition-all duration-200',
                    'hover:scale-110 active:scale-95',
                    isDark
                      ? 'text-stone-400 hover:bg-stone-700/50 hover:text-stone-300'
                      : 'text-stone-600 hover:bg-stone-200/50 hover:text-stone-700'
                  )}
                  title={t('batchDelete')}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              ) : (
                <>
                  {/* 批量删除执行按钮 */}
                  <button
                    onClick={handleBatchDelete}
                    disabled={selectedIds.size === 0 || isDeleting}
                    className={cn(
                      'rounded-md p-1.5 transition-all duration-200',
                      'hover:scale-110 active:scale-95',
                      selectedIds.size === 0 || isDeleting
                        ? 'cursor-not-allowed opacity-50'
                        : isDark
                          ? 'text-red-400 hover:bg-red-700/50 hover:text-red-300'
                          : 'text-red-600 hover:bg-red-100/50 hover:text-red-700'
                    )}
                    title={t('deleteSelected', { count: selectedIds.size })}
                  >
                    {isDeleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>

                  {/* 取消多选模式 */}
                  <button
                    onClick={() => {
                      setIsMultiSelectMode(false);
                      setSelectedIds(new Set());
                    }}
                    className={cn(
                      'rounded-md p-1.5 transition-all duration-200',
                      'hover:scale-110 active:scale-95',
                      isDark
                        ? 'text-stone-400 hover:bg-stone-700/50 hover:text-stone-300'
                        : 'text-stone-600 hover:bg-stone-200/50 hover:text-stone-700'
                    )}
                    title={t('cancelSelection')}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </>
              )}

              {/* 关闭按钮 */}
              {!isMultiSelectMode && (
                <button
                  onClick={handleClose}
                  className={cn(
                    'rounded-md p-1.5 transition-all duration-200',
                    'hover:scale-110 active:scale-95',
                    isDark
                      ? 'text-stone-400 hover:bg-stone-700/50 hover:text-stone-300'
                      : 'text-stone-600 hover:bg-stone-200/50 hover:text-stone-700'
                  )}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* --- 执行记录列表（独立滚动容器） --- */}
        <div
          className={cn(
            'flex-1 overflow-x-hidden overflow-y-auto',
            // --- 自定义滚动条样式 ---
            'scrollbar-thin',
            isDark
              ? 'scrollbar-track-stone-800 scrollbar-thumb-stone-600 hover:scrollbar-thumb-stone-500'
              : 'scrollbar-track-stone-100 scrollbar-thumb-stone-300 hover:scrollbar-thumb-stone-400',
            // --- 列表动画：从下方滑入 ---
            'transition-all delay-200 duration-300 ease-out',
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          )}
        >
          {isLoading ? (
            <div className="p-4 text-center">
              <div className="flex items-center justify-center gap-2">
                <Loader2
                  className={cn(
                    'h-4 w-4 animate-spin transition-all duration-300',
                    isDark ? 'text-stone-500' : 'text-stone-500',
                    isVisible ? 'scale-100' : 'scale-75'
                  )}
                />
                <div
                  className={cn(
                    'font-serif text-sm transition-all duration-300',
                    isDark ? 'text-stone-500' : 'text-stone-500',
                    isVisible ? 'opacity-100' : 'opacity-0'
                  )}
                >
                  {t('loading')}
                </div>
              </div>
            </div>
          ) : displayExecutions.length === 0 ? (
            <div className="p-4 text-center">
              <div
                className={cn(
                  'font-serif text-sm transition-all duration-300',
                  isDark ? 'text-stone-500' : 'text-stone-500',
                  isVisible
                    ? 'translate-y-0 opacity-100'
                    : 'translate-y-2 opacity-0'
                )}
              >
                {t('noRecords')}
              </div>
            </div>
          ) : (
            <div className="space-y-2 p-2">
              {displayExecutions.map((execution: AppExecution, index) => (
                <div
                  key={execution.id}
                  className={cn(
                    'transition-all duration-300 ease-out',
                    isVisible
                      ? 'translate-x-0 opacity-100'
                      : 'translate-x-4 opacity-0'
                  )}
                  style={{
                    transitionDelay: `${300 + index * 50}ms`, // 每个项目延迟50ms出现
                  }}
                >
                  <ExecutionItem
                    execution={execution}
                    onClick={() => handleViewExecution(execution)}
                    isMultiSelectMode={isMultiSelectMode}
                    isSelected={selectedIds.has(execution.id)}
                    isLoading={loadingExecutionId === execution.id}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
