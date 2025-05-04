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
import { useTheme } from '@lib/hooks';

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

  // --- Markdown 渲染器的组件配置 ---
  const markdownComponents: Components = {
    code({ className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '');
      // 如果不是带有语言标识的代码块 (inline code)
      return !className?.includes('language-') ? (
        <code className={cn(
          "px-2 py-1 rounded font-mono", 
          isDark ? "bg-gray-800 text-blue-300" : "bg-gray-100 text-blue-700"
        )} {...props}>
          {children}
        </code>
      ) : (
        // 如果是带有语言标识的代码块
        <pre className={cn(
          "rounded-md p-5 my-4 overflow-auto",
          isDark ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900",
          "border",
          isDark ? "border-gray-700" : "border-gray-200"
        )}>
          <code className={cn(className, 'block whitespace-pre-wrap text-base')} {...props}>
            {children}
          </code>
        </pre>
      );
    },
    
    // 表格渲染
    table({ className, children, ...props }: any) {
      return (
        <div className="overflow-x-auto my-5 border rounded-md w-full">
          <table className={cn(
            "min-w-full divide-y",
            isDark ? "divide-gray-700 border-gray-700" : "divide-gray-200 border-gray-200"
          )} {...props}>
            {children}
          </table>
        </div>
      );
    },
    
    // 表头单元格样式
    th({ className, children, ...props }: any) {
      return (
        <th 
          className={cn(
            "px-5 py-3 text-left font-medium text-base", 
            isDark ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
          )} 
          {...props}
        >
          {children}
        </th>
      );
    },
    
    // 表格数据单元格样式
    td({ className, children, ...props }: any) {
      return (
        <td 
          className={cn(
            "px-5 py-3 border-t text-base", 
            isDark ? "border-gray-700 text-gray-200" : "border-gray-200 text-gray-800"
          )} 
          {...props}
        >
          {children}
        </td>
      );
    },
    
    // 引用块样式
    blockquote({ className, children, ...props }: any) {
      return (
        <blockquote 
          className={cn(
            "pl-5 border-l-4 my-5 py-3", 
            isDark 
              ? "border-blue-600 bg-gray-900 text-gray-200" 
              : "border-blue-500 bg-gray-50 text-gray-800"
          )} 
          {...props}
        >
          {children}
        </blockquote>
      );
    },
    
    // 段落样式
    p({ className, children, ...props }: any) {
      return (
        <p 
          className={cn(
            "my-4 text-base leading-relaxed",
            isDark ? "text-gray-200" : "text-gray-800"
          )} 
          {...props}
        >
          {children}
        </p>
      );
    },
    
    // 标题样式
    h1({ className, children, ...props }: any) {
      return (
        <h1 
          className={cn(
            "text-2xl font-bold my-5",
            isDark ? "text-white" : "text-gray-900"
          )} 
          {...props}
        >
          {children}
        </h1>
      );
    },
    
    h2({ className, children, ...props }: any) {
      return (
        <h2 
          className={cn(
            "text-xl font-bold my-4",
            isDark ? "text-gray-100" : "text-gray-800"
          )} 
          {...props}
        >
          {children}
        </h2>
      );
    },
    
    h3({ className, children, ...props }: any) {
      return (
        <h3 
          className={cn(
            "text-lg font-semibold my-3",
            isDark ? "text-gray-200" : "text-gray-700"
          )} 
          {...props}
        >
          {children}
        </h3>
      );
    },
    
    // 列表样式
    ul({ className, children, ...props }: any) {
      return (
        <ul 
          className={cn(
            "my-4 pl-6 list-disc space-y-2 text-base",
            isDark ? "text-gray-200" : "text-gray-800"
          )} 
          {...props}
        >
          {children}
        </ul>
      );
    },
    
    ol({ className, children, ...props }: any) {
      return (
        <ol 
          className={cn(
            "my-4 pl-6 list-decimal space-y-2 text-base",
            isDark ? "text-gray-200" : "text-gray-800"
          )} 
          {...props}
        >
          {children}
        </ol>
      );
    },
    
    // 链接样式
    a({ className, children, ...props }: any) {
      return (
        <a 
          className={cn(
            "underline",
            isDark ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-800"
          )} 
          {...props}
        >
          {children}
        </a>
      );
    }
  };

  // 如果未展开，则不渲染任何内容
  if (!isOpen) {
    return null; 
  }

  // 渲染 Markdown 内容
  return (
    <div 
      id="think-block-content"
      className={cn(
        // 基础样式
        "think-block-content flex-1 overflow-hidden markdown-body w-full",
        // 边框和圆角
        "border rounded-md",
        // 背景 - 确保黑暗模式足够深
        isDark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200",
        // 内边距和文字颜色
        "p-5",
        isDark ? "text-gray-100" : "text-gray-900",
        // 文字排版 - 增大字体
        "font-sans text-base md:text-base lg:text-base",
        // 响应式调整
        "max-w-full md:max-w-full",
        // 确保可见性
        "block"
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeRaw]}
        components={markdownComponents}
        children={markdownContent}
      />
    </div>
  );
};