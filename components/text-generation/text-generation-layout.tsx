'use client';

import { ResizableSplitPane } from '@components/ui/resizable-split-pane';
import { ExecutionHistory } from '@components/workflow/execution-history';
import { MobileTabSwitcher } from '@components/workflow/mobile-tab-switcher';
import {
  WorkflowInputForm,
  WorkflowInputFormRef,
} from '@components/workflow/workflow-input-form';
import { useMobile } from '@lib/hooks/use-mobile';
import { useTextGenerationExecution } from '@lib/hooks/use-text-generation-execution';
import { useTheme } from '@lib/hooks/use-theme';
import { useWorkflowHistoryStore } from '@lib/stores/workflow-history-store';
import { cn } from '@lib/utils';
import { AlertCircle, RefreshCw, X } from 'lucide-react';

import React, { useCallback, useRef, useState } from 'react';

import { TextGenerationResultViewer } from './text-generation-result-viewer';
import { TextGenerationTracker } from './text-generation-tracker';

interface TextGenerationLayoutProps {
  instanceId: string;
}

/**
 * 文本生成主布局组件
 *
 * 布局特点：
 * - 桌面端：左右分栏布局（表单 + 跟踪器）
 * - 移动端：标签切换布局
 * - 可折叠的历史记录侧边栏
 * - 复用workflow的状态管理和数据流
 * - 适配文本生成的流式输出特点
 */
export function TextGenerationLayout({
  instanceId,
}: TextGenerationLayoutProps) {
  const { isDark } = useTheme();
  const isMobile = useMobile();

  // --- 文本生成执行系统 ---
  const {
    isExecuting,
    isStreaming,
    error,
    canRetry,
    currentExecution,
    generatedText,
    executeTextGeneration,
    stopTextGeneration,
    retryTextGeneration,
    resetTextGeneration,
  } = useTextGenerationExecution(instanceId);

  // --- 保留原有状态管理 ---
  const { showHistory, setShowHistory } = useWorkflowHistoryStore();
  const [mobileActiveTab, setMobileActiveTab] = useState<
    'form' | 'tracker' | 'history'
  >('form');

  // --- 结果查看器状态 ---
  const [showResultViewer, setShowResultViewer] = useState(false);
  const [viewerResult, setViewerResult] = useState<any>(null);
  const [viewerExecution, setViewerExecution] = useState<any>(null);

  // --- 表单重置引用 ---
  const formResetRef = useRef<WorkflowInputFormRef>(null);

  // --- 文本生成执行回调 ---
  const handleExecuteTextGeneration = useCallback(
    async (formData: Record<string, any>) => {
      console.log('[文本生成布局] 开始执行文本生成，输入数据:', formData);

      try {
        await executeTextGeneration(formData);
      } catch (error) {
        console.error('[文本生成布局] 执行失败:', error);
      }
    },
    [executeTextGeneration]
  );

  // --- 停止执行 ---
  const handleStopExecution = useCallback(async () => {
    console.log('[文本生成布局] 停止执行');
    try {
      await stopTextGeneration();
    } catch (error) {
      console.error('[文本生成布局] 停止执行失败:', error);
    }
  }, [stopTextGeneration]);

  // --- 重试执行 ---
  const handleRetryExecution = useCallback(async () => {
    console.log('[文本生成布局] 重试执行');
    try {
      await retryTextGeneration();
    } catch (error) {
      console.error('[文本生成布局] 重试执行失败:', error);
    }
  }, [retryTextGeneration]);

  // --- 完全重置（包括表单） ---
  const handleCompleteReset = useCallback(() => {
    console.log('[文本生成布局] 完全重置');

    // 重置执行状态
    resetTextGeneration();

    // 重置表单
    if (formResetRef.current?.resetForm) {
      formResetRef.current.resetForm();
    }
  }, [resetTextGeneration]);

  // --- 清除错误 ---
  const handleClearError = useCallback(() => {
    console.log('[文本生成布局] 清除错误');
    // 这里可以添加清除错误的逻辑
  }, []);

  // --- 节点状态更新回调（文本生成不需要，但保持接口一致） ---
  const handleNodeUpdate = useCallback((event: any) => {
    console.log('[文本生成布局] 节点更新:', event);
  }, []);

  // --- 查看结果回调 ---
  const handleViewResult = useCallback((result: any, execution: any) => {
    console.log('[文本生成布局] 查看结果:', result, execution);
    setViewerResult(result);
    setViewerExecution(execution);
    setShowResultViewer(true);
  }, []);

  // --- 关闭结果查看器 ---
  const handleCloseResultViewer = useCallback(() => {
    setShowResultViewer(false);
    setViewerResult(null);
    setViewerExecution(null);
  }, []);

  // --- 错误提示组件 ---
  const ErrorBanner = ({
    error,
    canRetry,
    onRetry,
    onDismiss,
  }: {
    error: string;
    canRetry: boolean;
    onRetry: () => void;
    onDismiss: () => void;
  }) => (
    <div
      className={cn(
        'flex items-center gap-3 border-l-4 border-red-500 px-4 py-3',
        isDark ? 'bg-red-900/20 text-red-200' : 'bg-red-50 text-red-800'
      )}
    >
      <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500" />
      <div className="flex-1">
        <p className="font-serif text-sm">{error}</p>
      </div>
      <div className="flex items-center gap-2">
        {canRetry && (
          <button
            onClick={onRetry}
            className={cn(
              'rounded-md p-1.5 transition-colors',
              isDark
                ? 'text-red-300 hover:bg-red-800/50 hover:text-red-200'
                : 'text-red-700 hover:bg-red-200/50 hover:text-red-800'
            )}
            title="重试"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        )}
        <button
          onClick={onDismiss}
          className={cn(
            'rounded-md p-1.5 transition-colors',
            isDark
              ? 'text-red-300 hover:bg-red-800/50 hover:text-red-200'
              : 'text-red-700 hover:bg-red-200/50 hover:text-red-800'
          )}
          title="关闭"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  // --- 移动端布局 ---
  if (isMobile) {
    return (
      <div className="flex h-full flex-col overflow-hidden">
        {/* 全局错误提示 */}
        {error && (
          <ErrorBanner
            error={error}
            canRetry={canRetry}
            onRetry={handleRetryExecution}
            onDismiss={handleClearError}
          />
        )}

        {/* 移动端标签切换器 */}
        <MobileTabSwitcher
          activeTab={mobileActiveTab}
          onTabChange={setMobileActiveTab}
          hasHistory={showHistory}
        />

        {/* 内容区域 */}
        <div className="flex-1 overflow-hidden">
          {mobileActiveTab === 'form' && (
            <div className="h-full p-4">
              <WorkflowInputForm
                instanceId={instanceId}
                onExecute={handleExecuteTextGeneration}
                isExecuting={isExecuting}
                ref={formResetRef}
              />
            </div>
          )}

          {mobileActiveTab === 'tracker' && (
            <div className="h-full">
              <TextGenerationTracker
                isExecuting={isExecuting}
                isStreaming={isStreaming}
                generatedText={generatedText}
                currentExecution={currentExecution}
                onStop={handleStopExecution}
                onRetry={handleRetryExecution}
                onReset={handleCompleteReset}
              />
            </div>
          )}

          {mobileActiveTab === 'history' && (
            <div className="h-full">
              <ExecutionHistory
                instanceId={instanceId}
                onClose={() => setMobileActiveTab('form')}
                isMobile={true}
                onViewResult={handleViewResult}
              />
            </div>
          )}
        </div>

        {/* 结果查看器弹窗 */}
        {showResultViewer && viewerResult && viewerExecution && (
          <TextGenerationResultViewer
            result={viewerResult}
            execution={viewerExecution}
            onClose={handleCloseResultViewer}
          />
        )}
      </div>
    );
  }

  // --- 桌面端布局 ---
  return (
    <div className="relative flex h-full flex-col overflow-hidden">
      {/* 全局错误提示 */}
      {error && (
        <ErrorBanner
          error={error}
          canRetry={canRetry}
          onRetry={handleRetryExecution}
          onDismiss={handleClearError}
        />
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* 主内容区域 */}
        <div
          className={cn(
            'relative flex-1 overflow-hidden transition-all duration-300',
            showHistory ? 'lg:w-2/3' : 'w-full'
          )}
        >
          <ResizableSplitPane
            storageKey="text-generation-split-pane"
            defaultLeftWidth={50}
            minLeftWidth={25}
            maxLeftWidth={75}
            left={
              <div className="hide-all-scrollbars flex h-full flex-col overflow-hidden">
                <div className="no-scrollbar flex-1 overflow-x-hidden overflow-y-auto px-8 pt-4 pb-12">
                  <WorkflowInputForm
                    instanceId={instanceId}
                    onExecute={handleExecuteTextGeneration}
                    isExecuting={isExecuting}
                    ref={formResetRef}
                  />
                </div>
              </div>
            }
            right={
              <div className="hide-all-scrollbars flex h-full flex-col overflow-hidden">
                <div className="no-scrollbar flex-1 overflow-x-hidden overflow-y-auto">
                  <TextGenerationTracker
                    isExecuting={isExecuting}
                    isStreaming={isStreaming}
                    generatedText={generatedText}
                    currentExecution={currentExecution}
                    onStop={handleStopExecution}
                    onRetry={handleRetryExecution}
                    onReset={handleCompleteReset}
                  />
                </div>
              </div>
            }
          />
        </div>

        {/* 历史记录侧边栏 */}
        {showHistory && (
          <div
            className={cn(
              'w-80 min-w-72 overflow-hidden border-l',
              'transition-all duration-300 ease-in-out',
              'transform-gpu', // 使用GPU加速
              isDark ? 'border-stone-700' : 'border-stone-200'
            )}
          >
            <ExecutionHistory
              instanceId={instanceId}
              onClose={() => setShowHistory(false)}
              isMobile={false}
              onViewResult={handleViewResult}
            />
          </div>
        )}
      </div>

      {/* 结果查看器弹窗 */}
      {showResultViewer && viewerResult && viewerExecution && (
        <TextGenerationResultViewer
          result={viewerResult}
          execution={viewerExecution}
          onClose={handleCloseResultViewer}
        />
      )}
    </div>
  );
}
