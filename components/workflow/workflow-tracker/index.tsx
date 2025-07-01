'use client';

import { useTheme } from '@lib/hooks/use-theme';
// --- 集成真实的节点状态 ---
import { useWorkflowExecutionStore } from '@lib/stores/workflow-execution-store';
import { cn } from '@lib/utils';
import { Loader2, Play } from 'lucide-react';

import React, { useEffect, useRef, useState } from 'react';

import { useTranslations } from 'next-intl';

import { ExecutionBar } from './execution-bar';
import { ResultViewer } from './result-viewer';
import { UnifiedStatusPanel } from './unified-status-panel';

interface WorkflowTrackerProps {
  isExecuting: boolean;
  executionResult: any;
  currentExecution: any;
  onNodeUpdate: (event: any) => void;
  onStop?: () => void;
  onRetry?: () => void;
  onReset?: () => void;
}

/**
 * 工作流节点跟踪器组件
 *
 * 功能特点：
 * - 实时显示工作流执行状态
 * - 细粒度节点进度跟踪
 * - 执行结果展示
 * - 支持 SSE 事件处理
 * - 统一的状态面板（合并了控制面板和状态显示）
 */
export function WorkflowTracker({
  isExecuting,
  executionResult,
  currentExecution,
  onNodeUpdate,
  onStop,
  onRetry,
  onReset,
}: WorkflowTrackerProps) {
  const { isDark } = useTheme();
  const tStatus = useTranslations('pages.workflow.status');
  const tForm = useTranslations('pages.workflow.form');
  const tNodeStatus = useTranslations('pages.workflow.nodeStatus');
  const [showResult, setShowResult] = useState(false);

  // --- 从store获取真实的节点状态 ---
  const nodes = useWorkflowExecutionStore(state => state.nodes);
  const currentNodeId = useWorkflowExecutionStore(state => state.currentNodeId);
  const progress = useWorkflowExecutionStore(state => state.executionProgress);
  const error = useWorkflowExecutionStore(state => state.error);
  const canRetry = useWorkflowExecutionStore(state => state.canRetry);
  const iterationExpandedStates = useWorkflowExecutionStore(
    state => state.iterationExpandedStates
  );
  const loopExpandedStates = useWorkflowExecutionStore(
    state => state.loopExpandedStates
  );

  // 🎯 过滤和分组节点：根据展开状态控制迭代/循环中的节点显示
  const getVisibleNodes = () => {
    const visibleNodes = [];

    for (const node of nodes) {
      // 🎯 容器节点（迭代/循环/并行分支）总是显示
      if (node.isIterationNode || node.isLoopNode || node.isParallelNode) {
        visibleNodes.push(node);
      }
      // 非嵌套节点总是显示
      else if (!node.isInIteration && !node.isInLoop) {
        visibleNodes.push(node);
      }
      // 迭代中的子节点：根据容器展开状态决定是否显示
      else if (node.isInIteration) {
        // 迭代中的节点：需要找到对应的迭代容器节点
        const iterationNode = nodes.find(
          n =>
            n.isIterationNode &&
            n.id !== node.id &&
            // 简单的判断：如果迭代节点在当前节点之前，则认为是其容器
            nodes.indexOf(n) < nodes.indexOf(node)
        );

        // 如果找到迭代容器节点且已展开，则显示此迭代中的节点
        if (iterationNode && iterationExpandedStates[iterationNode.id]) {
          visibleNodes.push(node);
        }
      }
      // 循环中的子节点：根据容器展开状态决定是否显示
      else if (node.isInLoop) {
        // 循环中的节点：需要找到对应的循环容器节点
        const loopNode = nodes.find(
          n =>
            n.isLoopNode &&
            n.id !== node.id &&
            // 简单的判断：如果循环节点在当前节点之前，则认为是其容器
            nodes.indexOf(n) < nodes.indexOf(node)
        );

        // 如果找到循环容器节点且已展开，则显示此循环中的节点
        if (loopNode && loopExpandedStates[loopNode.id]) {
          visibleNodes.push(node);
        }
      }
    }

    return visibleNodes;
  };

  // --- 自动打开结果查看器 ---
  const prevExecutionRef = useRef<string | null>(null);

  useEffect(() => {
    // 当执行完成且有结果时，自动打开（仅在新的执行完成时触发）
    const currentExecutionId =
      currentExecution?.id || currentExecution?.task_id;

    if (
      !isExecuting &&
      currentExecution?.status === 'completed' &&
      executionResult &&
      currentExecutionId &&
      prevExecutionRef.current !== currentExecutionId
    ) {
      setShowResult(true);
      prevExecutionRef.current = currentExecutionId;
    }
  }, [
    isExecuting,
    currentExecution?.status,
    currentExecution?.id,
    currentExecution?.task_id,
    executionResult,
  ]);

  return (
    <div className="flex h-full flex-col">
      {/* --- 统一状态面板 --- */}
      {(onStop || onRetry || onReset) &&
        (isExecuting || currentExecution || error) && (
          <UnifiedStatusPanel
            isExecuting={isExecuting}
            progress={progress}
            error={error}
            canRetry={canRetry}
            currentExecution={currentExecution}
            onStop={onStop || (() => {})}
            onRetry={onRetry || (() => {})}
            onReset={onReset || (() => {})}
            onShowResult={() => setShowResult(true)}
          />
        )}

      {/* --- 节点列表 --- */}
      <div className="flex-1 overflow-y-auto px-6 pt-2 pb-4">
        {!isExecuting && !currentExecution && nodes.length === 0 ? (
          // 空状态
          <div className="flex h-full items-center justify-center">
            <div className="space-y-4 text-center">
              <div
                className={cn(
                  'mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed',
                  isDark ? 'border-stone-600' : 'border-stone-300'
                )}
              >
                <Play
                  className={cn(
                    'h-6 w-6',
                    isDark ? 'text-stone-400' : 'text-stone-500'
                  )}
                />
              </div>
              <div className="space-y-2">
                <h3
                  className={cn(
                    'font-serif text-lg font-semibold',
                    isDark ? 'text-stone-200' : 'text-stone-800'
                  )}
                >
                  {tStatus('pending')}
                </h3>
                <p
                  className={cn(
                    'font-serif text-sm',
                    isDark ? 'text-stone-400' : 'text-stone-600'
                  )}
                >
                  {tForm('startExecution')}
                </p>
              </div>
            </div>
          </div>
        ) : (
          // 节点进度列表
          <div className="space-y-4">
            <div className="mb-4 flex items-center gap-2">
              <h3
                className={cn(
                  'font-serif text-lg font-semibold',
                  isDark ? 'text-stone-200' : 'text-stone-800'
                )}
              >
                {tForm('executing')}
              </h3>
            </div>

            {/* 如果没有真实节点数据，显示一个简单的占位 */}
            {nodes.length === 0 && (isExecuting || currentExecution) ? (
              <div
                className={cn(
                  'rounded-lg border-2 border-dashed p-4',
                  isDark
                    ? 'border-stone-600 bg-stone-800/50'
                    : 'border-stone-300 bg-stone-50'
                )}
              >
                <div className="flex items-center gap-3">
                  <Loader2
                    className={cn(
                      'h-5 w-5 animate-spin',
                      isDark ? 'text-stone-400' : 'text-stone-600'
                    )}
                  />
                  <div>
                    <div
                      className={cn(
                        'font-serif font-medium',
                        isDark ? 'text-stone-200' : 'text-stone-800'
                      )}
                    >
                      {tStatus('running')}
                    </div>
                    <div
                      className={cn(
                        'font-serif text-sm',
                        isDark ? 'text-stone-400' : 'text-stone-600'
                      )}
                    >
                      {tNodeStatus('waitingParallel')}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // 🎯 显示过滤后的节点数据：根据展开状态控制迭代/循环中的节点显示
              getVisibleNodes().map((node, index) => (
                <ExecutionBar
                  key={node.id}
                  node={node}
                  index={index}
                  delay={index * 200} // 每个条延迟200ms出现
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* --- 结果查看器 --- */}
      {showResult && executionResult && (
        <ResultViewer
          result={executionResult}
          execution={currentExecution}
          onClose={() => setShowResult(false)}
        />
      )}
    </div>
  );
}
