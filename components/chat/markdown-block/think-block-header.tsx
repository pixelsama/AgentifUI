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
 * ThinkBlock 的水平按钮样式标题栏组件
 * 显示展开/折叠图标、思考状态文本 ("正在深度思考" 或 "已深度思考") 和加载 Spinner。
 * --- 中文注释: 该组件负责渲染 ThinkBlock 的可交互标题栏，样式类似按钮 --- 
 */
export const ThinkBlockHeader: React.FC<ThinkBlockHeaderProps> = ({ 
  isThinking, 
  isOpen, 
  onToggle 
}) => {
  const { t } = useTranslation();

  // --- 中文注释: 根据展开状态确定按钮的提示文本 --- 
  const buttonTitle = isOpen ? t('common.chat.hide_thought') : t('common.chat.show_thought');

  return (
    <button 
      className={cn(
        // --- 中文注释: 基础布局：Flex, 垂直居中, 两端对齐 --- 
        "flex items-center justify-between", 
        // --- 中文注释: 尺寸和样式：宽度占满，调整垂直内边距使其更矮，圆角，下边距，可点击 --- 
        "w-[22%] px-3 py-1.5 rounded-md cursor-pointer mb-1 text-sm", // 修改了宽度为22%
        // --- 中文注释: 背景和边框颜色根据思考状态变化 --- 
        isThinking
          ? "bg-blue-50 border border-blue-200 dark:bg-blue-900/30 dark:border-blue-800/60" // 思考中
          : "bg-gray-100 border border-gray-200 hover:bg-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700", // 非思考中
        // --- 中文注释: 焦点样式和过渡效果 --- 
        "focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-600",
        "transition-all duration-200 ease-in-out"
      )}
      onClick={onToggle} // --- 中文注释: 点击时调用切换函数 --- 
      aria-expanded={isOpen} // --- 中文注释: 无障碍属性，指示是否展开 --- 
      aria-controls="think-block-content" // --- 中文注释: 无障碍属性，关联内容区域 --- 
      title={buttonTitle} // --- 中文注释: 鼠标悬停提示 --- 
    >
      {/* --- 左侧区域：图标和状态文本 --- */}
      <div className="flex items-center">
        {/* --- 展开/折叠图标 --- */}
        <svg
          className={cn(
            "h-4 w-4 mr-2 transition-transform duration-300 ease-in-out", // --- 中文注释: 图标大小，右边距，旋转过渡 --- 
            isOpen ? "rotate-90" : "rotate-0", // --- 中文注释: 根据展开状态旋转 --- 
            isThinking ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400" // --- 中文注释: 图标颜色根据思考状态变化 --- 
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
          "font-medium", // --- 中文注释: 字体加粗 --- 
          isThinking ? "text-blue-700 dark:text-blue-300" : "text-gray-700 dark:text-gray-300" // --- 中文注释: 文本颜色根据思考状态变化 --- 
        )}>
          {/* --- 中文注释: 显示"正在深度思考"或"已完成思考" --- */}
          {isThinking 
            ? t('正在深度思考') 
            : t('已深度思考')
          }
        </span>
      </div>

      {/* --- 右侧区域：Spinner (仅在思考中显示) --- */}
      <div className="h-4 w-4"> {/* --- 中文注释: 占位符，防止 Spinner 显示/隐藏时布局跳动 --- */} 
        {isThinking && (
          <Spinner 
            size="md" 
            className={cn(isThinking ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400")} // --- 中文注释: Spinner 颜色与状态匹配 --- 
          />
        )}
      </div>
    </button>
  );
}; 