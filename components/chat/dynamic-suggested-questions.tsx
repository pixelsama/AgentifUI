'use client';

import { SuggestedQuestionButton } from '@components/ui/suggested-question-button';
import { useChatWidth } from '@lib/hooks';
import { useCurrentApp } from '@lib/hooks/use-current-app';
import { useWelcomeLayout } from '@lib/hooks/use-welcome-layout';
import { useChatInputStore } from '@lib/stores/chat-input-store';
import { useTypewriterStore } from '@lib/stores/ui/typewriter-store';
import { cn } from '@lib/utils';

import React, { useEffect, useMemo, useState } from 'react';

interface DynamicSuggestedQuestionsProps {
  className?: string;
  onQuestionClick?: (messageText: string, files?: any[]) => Promise<void>;
}

/**
 * 动态推荐问题组件
 * 从数据库配置中获取推荐问题并渐进显示
 * 等待欢迎文字打字机完成后才开始渲染
 */
export const DynamicSuggestedQuestions = ({
  className,
  onQuestionClick,
}: DynamicSuggestedQuestionsProps) => {
  const { widthClass, paddingClass } = useChatWidth();
  const { currentAppInstance, isValidating, isLoading } = useCurrentApp();
  const { setMessage } = useChatInputStore();

  // 🎯 监听打字机完成状态
  const { isWelcomeTypewriterComplete } = useTypewriterStore();

  // 使用智能布局系统获取推荐问题的位置
  const { suggestedQuestions: questionsPosition, needsCompactLayout } =
    useWelcomeLayout();

  // 🎯 应用切换状态检测，与welcome-screen保持一致
  const [isAppSwitching, setIsAppSwitching] = useState(false);
  const [displayQuestions, setDisplayQuestions] = useState<string[]>([]);
  const [shouldShowQuestions, setShouldShowQuestions] = useState(false);

  // 🎯 应用切换检测逻辑，与welcome-screen完全一致
  useEffect(() => {
    const pathname = window.location.pathname;
    const isOnAppDetailPage =
      pathname.startsWith('/apps/') && pathname.split('/').length === 4;
    const isOnNewChatPage = pathname === '/chat/new';

    if (isOnAppDetailPage) {
      const urlInstanceId = pathname.split('/')[3];
      const currentInstanceId = currentAppInstance?.instance_id;

      const isUrlAppMismatch =
        currentInstanceId && currentInstanceId !== urlInstanceId;
      const isLoadingWithTargetApp =
        (isValidating || isLoading) && urlInstanceId;
      const isNoAppButHasTarget = !currentInstanceId && urlInstanceId;

      if (isUrlAppMismatch || isLoadingWithTargetApp || isNoAppButHasTarget) {
        setIsAppSwitching(true);
      } else if (
        currentInstanceId === urlInstanceId &&
        !isValidating &&
        !isLoading
      ) {
        setIsAppSwitching(false);
      }
    } else if (isOnNewChatPage) {
      const appMetadata = currentAppInstance?.config?.app_metadata;
      const isModelApp = appMetadata?.app_type === 'model';

      if (currentAppInstance && !isModelApp) {
        setIsAppSwitching(true);
      } else if (isModelApp && !isValidating && !isLoading) {
        setIsAppSwitching(false);
      }
    } else {
      setIsAppSwitching(false);
    }
  }, [
    currentAppInstance?.instance_id,
    currentAppInstance?.config?.app_metadata,
    isValidating,
    isLoading,
  ]);

  // 🎯 获取推荐问题，等待打字机完成后才开始处理
  useEffect(() => {
    // 🎯 核心条件：必须等待打字机完成
    if (!isWelcomeTypewriterComplete) {
      setShouldShowQuestions(false);
      return;
    }

    // 应用切换保护：验证期间或应用切换期间不更新推荐问题
    if (isValidating || isLoading || isAppSwitching) {
      setShouldShowQuestions(false);
      return;
    }

    // 🎯 应用实例完整性检查
    if (!currentAppInstance?.instance_id) {
      setShouldShowQuestions(false);
      return;
    }

    // 🎯 路径一致性检查
    const pathname = window.location.pathname;
    const isOnAppDetailPage =
      pathname.startsWith('/apps/') && pathname.split('/').length === 4;

    if (isOnAppDetailPage) {
      const urlInstanceId = pathname.split('/')[3];
      if (currentAppInstance.instance_id !== urlInstanceId) {
        setShouldShowQuestions(false);
        return;
      }
    }

    // 🎯 延迟处理：在打字机完成后稍等片刻再开始渲染推荐问题
    const updateTimer = setTimeout(() => {
      // 🎯 从数据库config字段直接获取推荐问题
      const suggestedQuestions =
        currentAppInstance?.config?.dify_parameters?.suggested_questions;

      if (
        suggestedQuestions &&
        Array.isArray(suggestedQuestions) &&
        suggestedQuestions.length > 0
      ) {
        // 过滤空字符串和无效问题
        const validQuestions = suggestedQuestions
          .filter(q => q && typeof q === 'string' && q.trim().length > 0)
          .map(q => q.trim());

        if (validQuestions.length > 0) {
          setDisplayQuestions(validQuestions);
          setShouldShowQuestions(true);
        } else {
          setDisplayQuestions([]);
          setShouldShowQuestions(false);
        }
      } else {
        setDisplayQuestions([]);
        setShouldShowQuestions(false);
      }
    }, 300); // 打字机完成后等待300ms再开始渲染

    return () => clearTimeout(updateTimer);
  }, [
    isWelcomeTypewriterComplete, // 🎯 核心依赖：打字机完成状态
    currentAppInstance?.config?.dify_parameters?.suggested_questions,
    currentAppInstance?.instance_id,
    isValidating,
    isLoading,
    isAppSwitching,
  ]);

  // 🎯 智能布局计算：根据问题数量动态调整布局
  // 改用flexbox布局，让按钮根据内容宽度居中显示
  const layoutConfig = useMemo(() => {
    const count = displayQuestions.length;

    if (count === 0) return null;

    // 使用flexbox布局，支持按钮内容自适应宽度并居中
    // 最多显示6个问题
    return {
      maxDisplay: count > 6 ? 6 : count,
      description: `${count}个问题-flexbox居中`,
    };
  }, [displayQuestions.length]);

  // 🎯 问题点击处理 - 修改为直接发送消息
  const handleQuestionClick = async (question: string) => {
    if (onQuestionClick) {
      // 🎯 直接发送消息，相当于在输入框中输入并点击发送
      try {
        await onQuestionClick(question);
      } catch (error) {
        console.error('[DynamicSuggestedQuestions] 发送消息失败:', error);
        // 如果直接发送失败，回退到设置输入框内容
        setMessage(question);
      }
    } else {
      // 回退行为：仅设置到输入框
      setMessage(question);
    }
  };

  // 如果没有问题或不应该显示，则不渲染
  if (!shouldShowQuestions || !layoutConfig || displayQuestions.length === 0) {
    return null;
  }

  // 限制显示的问题数量
  const questionsToShow = displayQuestions.slice(0, layoutConfig.maxDisplay);

  return (
    <div
      className={cn(
        'mx-auto w-full',
        widthClass,
        paddingClass,
        'absolute left-1/2',
        className
      )}
      style={questionsPosition}
    >
      {/* Question container: uses flexbox layout, supports multi-line wrapping with center alignment on each line */}
      <div className="flex flex-wrap items-start justify-center gap-3">
        {questionsToShow.map((question, index) => (
          <SuggestedQuestionButton
            key={`${currentAppInstance?.instance_id}-${index}`}
            question={question}
            onClick={handleQuestionClick}
            animationDelay={index * 100} // 每个问题间隔100ms显示
            className={cn(needsCompactLayout && 'px-4 py-2 text-xs')}
          />
        ))}
      </div>

      {/* Show hint if there are more questions */}
      {displayQuestions.length > layoutConfig.maxDisplay && (
        <div
          className={cn(
            'animate-fade-in mt-3 text-center opacity-0',
            'font-serif text-xs text-stone-500'
          )}
          style={{
            animationDelay: `${questionsToShow.length * 100 + 200}ms`,
            animationFillMode: 'forwards',
          }}
        >
          还有 {displayQuestions.length - layoutConfig.maxDisplay} 个问题...
        </div>
      )}
    </div>
  );
};
