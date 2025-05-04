"use client";

import React from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@lib/utils';
import { Spinner } from '@components/ui/spinner';

/**
 * ThinkBlock 标题栏属性接口
 */
interface ThinkBlockHeaderProps {
  // 当前是否处于思考中状态
  isThinking: boolean;
  // 内容区域是否展开
  isOpen: boolean;
  // 点击时触发的回调函数
  onToggle: () => void;
}

/**
 * ThinkBlock 的水平标题栏组件
 * 显示展开/折叠图标、思考状态文本 ("正在深度思考" 或 "已完成思考") 和加载 Spinner。
 */
export const ThinkBlockHeader: React.FC<ThinkBlockHeaderProps> = ({ 
  isThinking, 
  isOpen, 
  onToggle 
}) => {
  const { t } = useTranslation();

  // --- 获取当前主题颜色，用于动态设置 Spinner 颜色 (可选) ---
  // const { isDark } = useTheme(); // 如果需要根据主题调整颜色

  // --- 确定按钮的提示文本 --- 
  const buttonTitle = isOpen ? t('common.chat.hide_thought') : t('common.chat.show_thought');

  return (
    <button 
      className={cn(
        // --- 整体布局和样式 ---
        "flex items-center justify-between", // Flex 布局，两端对齐
        "w-full p-2 rounded-md cursor-pointer mb-1", // 宽度占满，内边距，圆角，指针，下边距
        // --- 背景和边框颜色 (根据思考状态) ---
        isThinking
          ? "bg-blue-50 border border-blue-200 dark:bg-blue-900/30 dark:border-blue-800/60" // 思考中状态
          : "bg-gray-100 border border-gray-200 hover:bg-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700", // 非思考中状态
        // --- 焦点和过渡效果 ---
        "focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-600",
        "transition-all duration-200 ease-in-out" // 平滑过渡
      )}
      onClick={onToggle} // 点击切换展开/折叠
      aria-expanded={isOpen} // 无障碍属性，表示是否展开
      aria-controls="think-block-content" // 无障碍属性，关联内容区域
      title={buttonTitle} // 鼠标悬停提示
    >
      {/* --- 左侧：图标和文本 --- */}
      <div className="flex items-center">
        {/* --- 展开/折叠图标 --- */}
        <svg
          className={cn(
            "h-4 w-4 mr-2 transition-transform duration-300 ease-in-out", // 图标尺寸、右边距、过渡效果
            isOpen ? "rotate-90" : "rotate-0", // 根据展开状态旋转
            isThinking ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400" // 根据思考状态改变颜色
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
        {/* --- 状态文本 --- */}
        <span className={cn(
          "text-sm font-medium", // 字体大小和粗细
          isThinking ? "text-blue-700 dark:text-blue-300" : "text-gray-700 dark:text-gray-300" // 根据思考状态改变颜色
        )}>
          {isThinking 
            ? t('common.chat.thinking_deeply') // 思考中
            : t('common.chat.thought_complete') // 已完成
          }
        </span>
      </div>

      {/* --- 右侧：Spinner (仅在思考中显示) --- */}
      <div className="h-4 w-4"> {/* 占位符，确保布局稳定 */} 
        {isThinking && (
          <Spinner size="sm" className={cn(isThinking ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400")} />
        )}
      </div>
    </button>
  );
}; 