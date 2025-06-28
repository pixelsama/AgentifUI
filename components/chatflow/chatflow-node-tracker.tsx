'use client';

import { useTheme } from '@lib/hooks/use-theme';
import { useChatflowExecutionStore } from '@lib/stores/chatflow-execution-store';
import { cn } from '@lib/utils';
import { Loader2, Workflow } from 'lucide-react';

import React, { useEffect } from 'react';

import { useTranslations } from 'next-intl';

import { ChatflowExecutionBar } from './chatflow-execution-bar';

interface ChatflowNodeTrackerProps {
  isVisible: boolean;
  className?: string;
}

/**
 * Chatflow 节点跟踪器组件
 *
 * 功能：
 * - 显示 chatflow 执行过程中的节点进度
 * - 实时更新节点状态
 * - fade-in 动画显示
 * - 临时UI，刷新后消失
 * - 不影响正常的流式响应
 */
export function ChatflowNodeTracker({
  isVisible,
  className,
}: ChatflowNodeTrackerProps) {
  const { isDark } = useTheme();
  const t = useTranslations('pages.chatflow.nodeTracker');

  // 从 store 获取节点状态
  const nodes = useChatflowExecutionStore(state => state.nodes);
  const isExecuting = useChatflowExecutionStore(state => state.isExecuting);
  const executionProgress = useChatflowExecutionStore(
    state => state.executionProgress
  );
  const error = useChatflowExecutionStore(state => state.error);
  const iterationExpandedStates = useChatflowExecutionStore(
    state => state.iterationExpandedStates
  );
  const loopExpandedStates = useChatflowExecutionStore(
    state => state.loopExpandedStates
  );

  // 🎯 过滤和分组节点：根据展开状态控制迭代/循环中的节点显示
  const getVisibleNodes = () => {
    const visibleNodes = [];

    for (const node of nodes) {
      // 🎯 修复：容器节点（迭代/循环/并行分支）总是显示
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

  const visibleNodes = getVisibleNodes();

  // 如果不可见，不显示
  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={cn(
        'transform transition-all duration-300',
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0',
        className
      )}
    >
      <div
        className={cn(
          'space-y-3 rounded-lg border p-4',
          // 限制实际宽度，避免与聊天内容冲突
          'max-w-[320px] min-w-[280px]',
          isDark
            ? 'border-stone-700/50 bg-stone-800/50 backdrop-blur-sm'
            : 'border-stone-200 bg-white/80 backdrop-blur-sm'
        )}
      >
        {/* 标题栏 */}
        <div
          className={cn(
            'flex items-center gap-2 border-b pb-2',
            isDark ? 'border-stone-700/50' : 'border-stone-200/50'
          )}
        >
          <Workflow
            className={cn(
              'h-4 w-4',
              isDark ? 'text-stone-400' : 'text-stone-600'
            )}
          />
          <span
            className={cn(
              'font-serif text-sm font-medium',
              isDark ? 'text-stone-200' : 'text-stone-800'
            )}
          >
            {t('title')}
          </span>
        </div>

        {/* 节点列表 */}
        <div className="relative space-y-2">
          {' '}
          {/* 🎯 添加relative用于竖线定位 */}
          {nodes.length === 0 ? (
            // 没有节点数据时的显示
            <div
              className={cn(
                'flex items-center gap-3 rounded-lg border-2 border-dashed px-4 py-3',
                isDark
                  ? 'border-stone-600 bg-stone-800/30'
                  : 'border-stone-300 bg-stone-50'
              )}
            >
              {isExecuting ? (
                <Loader2
                  className={cn(
                    'h-4 w-4 animate-spin',
                    isDark ? 'text-stone-400' : 'text-stone-600'
                  )}
                />
              ) : (
                <Workflow
                  className={cn(
                    'h-4 w-4',
                    isDark ? 'text-stone-400' : 'text-stone-600'
                  )}
                />
              )}
              <div>
                <div
                  className={cn(
                    'font-serif text-sm font-medium',
                    isDark ? 'text-stone-200' : 'text-stone-800'
                  )}
                >
                  {isExecuting ? t('starting') : t('noRecords')}
                </div>
                <div
                  className={cn(
                    'font-serif text-xs',
                    isDark ? 'text-stone-400' : 'text-stone-600'
                  )}
                >
                  {isExecuting ? t('waitingUpdate') : t('showProgress')}
                </div>
              </div>
            </div>
          ) : (
            // 🎯 显示过滤后的节点列表
            visibleNodes.map((node, index) => (
              <ChatflowExecutionBar
                key={node.id}
                node={node}
                index={index}
                delay={index * 150} // 每个条延迟150ms出现
              />
            ))
          )}
        </div>

        {/* 错误信息 */}
        {error && (
          <div
            className={cn(
              'mt-3 rounded-lg border p-3',
              isDark
                ? 'border-red-700/50 bg-red-900/20 text-red-200'
                : 'border-red-200 bg-red-50 text-red-700'
            )}
          >
            <div className="font-serif text-sm">
              <strong>执行错误：</strong> {error}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
