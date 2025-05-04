"use client";

import React from 'react';
import { cn } from '@lib/utils';
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import "katex/dist/katex.min.css";
import type { Components } from "react-markdown";
import { useTheme } from '@lib/hooks'; // 引入 useTheme

/**
 * ThinkBlock 内容容器的属性接口
 */
interface ThinkBlockContentProps {
  // 要显示的 Markdown 内容
  markdownContent: string;
  // 内容区域是否可见
  isOpen: boolean;
}

/**
 * ThinkBlock 的内容显示容器
 * 根据 isOpen 状态显示或隐藏，并使用 ReactMarkdown 渲染内容。
 */
export const ThinkBlockContent: React.FC<ThinkBlockContentProps> = ({ markdownContent, isOpen }) => {
  const { isDark } = useTheme(); // 获取主题状态

  // --- Markdown 渲染器的组件配置 (与 AssistantMessage 保持一致) ---
  // --- 中文注释: 定义 Markdown 中特定元素（如代码块、表格）的渲染方式 --- 
  const markdownComponents: Components = {
    code({ className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '');
      // --- 中文注释: 如果不是带有语言标识的代码块 (inline code)，则应用不同的背景和内边距 --- 
      return !className?.includes('language-') ? (
        <code className={cn("px-1 py-0.5 rounded", isDark ? "bg-gray-700" : "bg-gray-200")} {...props}> {/* 调整了暗色模式背景 */} 
          {children}
        </code>
      ) : (
        // --- 中文注释: 如果是带有语言标识的代码块，则使用 pre 标签包裹，并应用代码块样式 --- 
        <pre className={cn("rounded-md p-4 my-2 text-sm", isDark ? "bg-gray-800/80" : "bg-gray-100/80")}> {/* 调整了背景透明度和字体大小 */} 
          <code className={cn(className, 'block whitespace-pre-wrap')} {...props}> {/* 确保长代码换行 */} 
            {children}
          </code>
        </pre>
      );
    },
    // --- 中文注释: 表格渲染，添加外层 div 实现水平滚动 --- 
    table({ className, children, ...props }: any) {
      return (
        <div className="overflow-x-auto my-4 border rounded-md dark:border-gray-700"> 
          <table className={cn("min-w-full divide-y", isDark ? "divide-gray-700" : "divide-gray-200")} {...props}>
            {children}
          </table>
        </div>
      );
    },
    // --- 中文注释: 表头单元格样式 --- 
    th({ className, children, ...props }: any) {
      return (
        <th 
          className={cn("px-4 py-2 text-left font-medium", isDark ? "bg-gray-800" : "bg-gray-100")} 
          {...props}
        >
          {children}
        </th>
      );
    },
    // --- 中文注释: 表格数据单元格样式 --- 
    td({ className, children, ...props }: any) {
      return (
        <td 
          className={cn("px-4 py-2 border-t", isDark ? "border-gray-700" : "border-gray-200")} 
          {...props}
        >
          {children}
        </td>
      );
    },
    // --- 中文注释: 引用块样式 --- 
    blockquote({ className, children, ...props }: any) {
      return (
        <blockquote 
          className={cn(
            "pl-4 border-l-4 my-4 py-1", // 添加垂直内边距
            isDark ? "border-gray-600 bg-gray-800/50" : "border-gray-300 bg-gray-100/50"
          )} 
          {...props}
        >
          {children}
        </blockquote>
      );
    }
  };

  // --- 如果未展开，则不渲染任何内容 --- 
  if (!isOpen) {
    return null; 
  }

  // --- 渲染 Markdown 内容 --- 
  return (
    <div 
      id="think-block-content" // 添加 ID 以便 aria-controls 关联
      className={cn(
        // --- 基础样式 ---
        "think-block-content flex-1 overflow-hidden markdown-body", // 占据剩余空间，隐藏溢出, 应用 markdown 基础样式
        "border rounded-md", // 边框和圆角
        "bg-gray-50/50 dark:bg-gray-800/50", // 背景色
        "p-3 text-sm", // 内边距和字体大小
        // --- 颜色 ---
        "border-gray-200 dark:border-gray-700",
        isDark ? "text-gray-300" : "text-gray-700", // 根据主题调整文字颜色
        // --- 确保可见性 ---
        "block" 
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]} // 支持 GFM 和数学公式
        rehypePlugins={[rehypeKatex, rehypeRaw]} // 支持 Katex 和原始 HTML
        components={markdownComponents} // 应用自定义组件渲染
        children={markdownContent}
      />
    </div>
  );
}; 