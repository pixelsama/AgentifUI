'use client';

import { TypeWriter } from '@components/ui/typewriter';
import { useCurrentApp } from '@lib/hooks/use-current-app';
import { useDateFormatter } from '@lib/hooks/use-date-formatter';
import { useWelcomeLayout } from '@lib/hooks/use-welcome-layout';
import { useTypewriterStore } from '@lib/stores/ui/typewriter-store';
import { cn } from '@lib/utils';

import React, { useEffect, useMemo, useState } from 'react';

interface WelcomeScreenProps {
  className?: string;
  username?: string | null;
}

export const WelcomeScreen = ({ className, username }: WelcomeScreenProps) => {
  // 🎯 使用统一的时间格式化Hook，替代重复的问候语逻辑
  const { getTimeBasedGreeting } = useDateFormatter();
  const [finalText, setFinalText] = useState('');
  // 🎯 新增：TypeWriter重置键，确保应用切换时能够重新打字
  const [typewriterKey, setTypewriterKey] = useState(0);

  // 🎯 新增：打字机状态管理
  const { setWelcomeTypewriterComplete, resetWelcomeTypewriter } =
    useTypewriterStore();

  // 🎯 新增：动态打字速度配置
  // 根据文字长度智能调整打字速度，提升长文本体验
  const typewriterConfig = useMemo(() => {
    const textLength = finalText.length;

    // 🎯 智能速度阈值配置
    // 短文本：慢速打字，营造仪式感
    // 中等文本：中速打字，平衡体验
    // 长文本：快速打字，避免等待过久
    // 超长文本：极速打字，快速完成
    if (textLength <= 20) {
      // 短文本（≤20字符）：慢速打字，营造仪式感
      return {
        speed: 20,
        delay: 50,
        description: '短文本-慢速',
      };
    } else if (textLength <= 50) {
      // 中短文本（21-50字符）：标准速度
      return {
        speed: 15,
        delay: 40,
        description: '中短文本-标准',
      };
    } else if (textLength <= 100) {
      // 中等文本（51-100字符）：中速打字
      return {
        speed: 10,
        delay: 30,
        description: '中等文本-中速',
      };
    } else if (textLength <= 200) {
      // 长文本（101-200字符）：快速打字
      return {
        speed: 5,
        delay: 10,
        description: '长文本-快速',
      };
    } else {
      // 超长文本（>200字符）：极速打字
      return {
        speed: 8,
        delay: 100,
        description: '超长文本-极速',
      };
    }
  }, [finalText.length]);

  // 使用智能布局系统获取欢迎文字的位置和标题样式
  const {
    welcomeText: welcomePosition,
    welcomeTextTitle,
    needsCompactLayout,
  } = useWelcomeLayout();

  // 🎯 直接从当前应用实例获取开场白配置
  // 完全基于数据库，无任何API调用
  // 添加验证状态保护，避免应用切换时显示错误内容
  // 🎯 新增：路径感知的状态保护，确保应用切换时序正确
  const { currentAppInstance, isValidating, isLoading } = useCurrentApp();

  // 🎯 移除复杂的应用切换检测逻辑，简化组件职责
  // 欢迎文字显示不应该依赖复杂的路径匹配和应用状态
  // 🎯 修复的欢迎文字显示逻辑
  // 优先级：数据库开场白 → 用户名问候 → 默认时间问候
  // 🚨 修复：重新添加阻塞等待机制，避免重复渲染错误的欢迎文字
  useEffect(() => {
    console.log('[WelcomeScreen] 当前状态:', {
      username,
      hasOpeningStatement:
        !!currentAppInstance?.config?.dify_parameters?.opening_statement,
      currentAppId: currentAppInstance?.instance_id,
      pathname: window.location.pathname,
      isValidating,
      isLoading,
    });

    // 🚨 修复：重新添加应用状态检查，避免在应用切换时显示错误内容
    // 这是防止重复渲染的关键阻塞点
    if (isValidating || isLoading) {
      console.log('[WelcomeScreen] 应用正在验证或加载中，暂停更新欢迎文字', {
        isValidating,
        isLoading,
      });
      return;
    }

    // 🎯 简化检查：只要用户名不是undefined就可以显示欢迎文字
    // 即使用户名是null也显示默认问候
    if (username === undefined) {
      console.log('[WelcomeScreen] 等待用户信息加载...');
      return;
    }

    // 🚨 修复：增加延迟时间，确保应用数据完全稳定后再渲染
    // 避免在应用切换过程中的中间状态渲染错误内容
    const updateTimer = setTimeout(() => {
      // 🎯 重置打字机状态，准备开始新的打字动画
      resetWelcomeTypewriter();

      // 🎯 确定最终显示的文字 - 简化版本
      let welcomeText = '';

      // 🎯 从数据库config字段直接获取开场白（如果有的话）
      const openingStatement =
        currentAppInstance?.config?.dify_parameters?.opening_statement;

      if (openingStatement && openingStatement.trim()) {
        // 情况1：数据库中有应用的开场白配置
        welcomeText = openingStatement.trim();
        console.log('[WelcomeScreen] 使用数据库开场白:', {
          appId: currentAppInstance?.instance_id,
          text: welcomeText.substring(0, 50) + '...',
        });
      } else if (username) {
        // 情况2：没有开场白但有用户名 → 个性化时间问候
        welcomeText = getTimeBasedGreeting({ includeUsername: true, username });
        console.log('[WelcomeScreen] 使用用户名问候:', welcomeText);
      } else {
        // 情况3：没有用户名 → 默认时间问候
        welcomeText = getTimeBasedGreeting();
        console.log('[WelcomeScreen] 使用默认问候:', welcomeText);
      }

      // 🎯 直接设置文字并强制重新开始打字动画
      setFinalText(welcomeText);
      setTypewriterKey(prev => prev + 1);

      console.log('[WelcomeScreen] 欢迎文字更新完成:', welcomeText);
    }, 200); // 🚨 修复：增加到200ms，确保应用数据稳定

    // 清理定时器
    return () => clearTimeout(updateTimer);
  }, [
    username,
    currentAppInstance?.config?.dify_parameters?.opening_statement,
    currentAppInstance?.instance_id,
    isValidating, // 🚨 修复：重新监听验证状态
    isLoading, // 🚨 修复：重新监听加载状态
    resetWelcomeTypewriter,
    getTimeBasedGreeting,
  ]);

  // 🎯 打字机完成回调
  const handleTypewriterComplete = () => {
    console.log('[WelcomeScreen] 打字机动画完成，通知推荐问题组件开始渲染');
    setWelcomeTypewriterComplete(true);
  };

  return (
    <div
      className={cn(
        'welcome-screen flex flex-col items-center justify-center text-center',
        className
      )}
      style={welcomePosition}
    >
      <div className="w-full">
        {/* Main title container: uses highest priority width settings provided by Hook */}
        <h2
          className={cn(
            'mx-auto mb-2 font-bold',
            needsCompactLayout ? 'text-xl' : 'text-2xl',
            'leading-tight'
          )}
          style={welcomeTextTitle}
        >
          {/* Optimized: Intelligent typewriter effect with dynamic speed adjustment based on text length */}
          {/* Short text: slow typing for ceremonial feel; Long text: fast typing to avoid waiting */}
          {/* Added key property to restart typewriter animation on app switch */}
          {/* Added onComplete callback to notify suggested questions component to start rendering */}
          <TypeWriter
            key={typewriterKey} // 🎯 强制重新开始打字动画
            text={finalText}
            speed={typewriterConfig.speed} // 🎯 动态速度
            delay={typewriterConfig.delay} // 🎯 动态延迟
            waitingEffect={finalText.endsWith('...')}
            onComplete={handleTypewriterComplete} // 🎯 打字机完成回调
            className={cn(
              'leading-tight font-bold',
              needsCompactLayout ? 'text-xl' : 'text-3xl'
            )}
          />
        </h2>
      </div>
    </div>
  );
};
