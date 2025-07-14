import { cn } from '@lib/utils';

import React, { useState } from 'react';

import {
  ChevronDownIcon,
  ChevronUpIcon,
  ClipboardDocumentIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

interface RetrieverResource {
  dataset_name: string;
  document_name: string;
  content: string;
  score: number;
  position: number;
  word_count?: number; // 改为可选字段，兼容不同Dify应用
  page?: number | null;
  dataset_id?: string;
  segment_id?: string;
  document_id?: string;
}

interface ReferenceSourcesProps {
  retrieverResources?: RetrieverResource[];
  isDark?: boolean;
  className?: string;
  animationDelay?: number;
}

export function ReferenceSources({
  retrieverResources,
  isDark = false,
  className,
  animationDelay = 0,
}: ReferenceSourcesProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // 如果没有引用资源，不渲染组件
  if (!retrieverResources || retrieverResources.length === 0) {
    return null;
  }

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const toggleItemExpanded = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  // 复制内容到剪贴板
  const handleCopy = async (content: string, index: number) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  // 格式化相关度分数
  const formatScore = (score: number) => {
    return (score * 100).toFixed(1) + '%';
  };

  // 截取内容用于概览
  const getContentPreview = (content: string, maxLength = 100) => {
    if (content.length <= maxLength) return content;
    return content.slice(0, maxLength) + '...';
  };

  return (
    <div className={cn('w-full', className)}>
      {/* --- 更细的头部bar - 微调优化 --- */}
      <button
        onClick={toggleExpanded}
        className={cn(
          'flex w-full items-center justify-between px-3 py-1.5',
          'rounded border transition-colors duration-150',
          'focus:outline-none',
          'animate-fade-in opacity-0',
          isDark
            ? 'border-stone-700/60 bg-stone-800/80 text-stone-100 hover:bg-stone-700/80'
            : 'border-stone-300/70 bg-stone-100/90 text-stone-800 hover:bg-stone-200/90'
        )}
        style={{
          animationDelay: `${animationDelay}ms`,
          animationFillMode: 'forwards',
        }}
      >
        <div className="flex items-center space-x-2">
          {isExpanded ? (
            <ChevronUpIcon
              className={cn(
                'h-3.5 w-3.5',
                isDark ? 'text-stone-400' : 'text-stone-600'
              )}
            />
          ) : (
            <ChevronDownIcon
              className={cn(
                'h-3.5 w-3.5',
                isDark ? 'text-stone-400' : 'text-stone-600'
              )}
            />
          )}
          <span className="font-serif text-sm font-medium">
            📚 引用了 {retrieverResources.length} 个知识库资源
          </span>
        </div>

        <span
          className={cn(
            'rounded-full px-2 py-0.5 font-serif text-xs',
            isDark
              ? 'bg-stone-600/80 text-stone-100'
              : 'bg-stone-300/80 text-stone-700'
          )}
        >
          {retrieverResources[0]?.dataset_name || '知识库'}
        </span>
      </button>

      {/* --- 优化后的展开引用列表 --- */}
      {isExpanded && (
        <div
          className={cn(
            'mt-2 overflow-hidden rounded-lg border',
            'animate-fade-in',
            isDark
              ? 'border-stone-700/50 bg-stone-800/50 backdrop-blur-sm'
              : 'border-stone-300/60 bg-stone-100/60 backdrop-blur-sm'
          )}
        >
          <div
            className={cn(
              'divide-y',
              isDark ? 'divide-stone-700/30' : 'divide-stone-200/30'
            )}
          >
            {retrieverResources.map((resource, index) => (
              <div
                key={`${resource.dataset_id}-${resource.segment_id}-${index}`}
                className={cn(
                  'p-4 transition-all duration-200',
                  isDark ? 'hover:bg-stone-800/60' : 'hover:bg-stone-200/70'
                )}
              >
                {/* --- 优化的头部信息行 --- */}
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex min-w-0 flex-1 items-center space-x-3">
                    {/* 序号圆圈 - 增强light模式对比度 */}
                    <div
                      className={cn(
                        'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-medium',
                        isDark
                          ? 'bg-stone-600 text-stone-200'
                          : 'bg-stone-300 text-stone-700'
                      )}
                    >
                      {index + 1}
                    </div>

                    {/* 文档标题 - 更突出 */}
                    <div className="min-w-0 flex-1">
                      <h4
                        className={cn(
                          'truncate font-serif text-sm font-semibold',
                          isDark ? 'text-stone-100' : 'text-stone-900'
                        )}
                      >
                        {resource.document_name}
                      </h4>
                      <div className="mt-0.5 flex items-center space-x-2">
                        <span
                          className={cn(
                            'rounded px-1.5 py-0.5 font-serif text-xs',
                            isDark
                              ? 'bg-stone-600/50 text-stone-300'
                              : 'bg-stone-300/70 text-stone-600'
                          )}
                        >
                          {resource.dataset_name}
                        </span>
                        {resource.word_count && (
                          <span
                            className={cn(
                              'font-serif text-xs',
                              isDark ? 'text-stone-400' : 'text-stone-600'
                            )}
                          >
                            {resource.word_count.toLocaleString()} 字
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 相关度分数 - 增强light模式对比度 */}
                  <div
                    className={cn(
                      'flex-shrink-0 rounded-full px-2 py-1 font-serif text-xs font-bold',
                      isDark
                        ? 'bg-stone-600 text-stone-200'
                        : 'bg-stone-300 text-stone-700'
                    )}
                  >
                    {formatScore(resource.score)}
                  </div>
                </div>

                {/* --- 优化的内容区域 --- */}
                <div
                  className={cn(
                    'mb-3 rounded-lg p-3',
                    isDark
                      ? 'border border-stone-700/30 bg-stone-900/50'
                      : 'border border-stone-300/60 bg-white/80'
                  )}
                >
                  <div
                    className={cn(
                      'font-serif text-sm leading-relaxed',
                      isDark ? 'text-stone-300' : 'text-stone-700'
                    )}
                  >
                    {expandedIndex === index ? (
                      <div className="scrollbar-thin scrollbar-thumb-stone-400 scrollbar-track-transparent max-h-40 overflow-y-auto">
                        <p className="whitespace-pre-wrap">
                          {resource.content}
                        </p>
                      </div>
                    ) : (
                      <p>{getContentPreview(resource.content)}</p>
                    )}
                  </div>
                </div>

                {/* --- 优化的操作按钮区域 --- */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {/* 展开/收起按钮 */}
                    {resource.content.length > 100 && (
                      <button
                        onClick={() => toggleItemExpanded(index)}
                        className={cn(
                          'inline-flex items-center space-x-1 rounded px-2 py-1 font-serif text-xs font-medium',
                          'transition-colors duration-150 focus:outline-none',
                          isDark
                            ? 'text-stone-400 hover:bg-stone-700/50 hover:text-stone-200'
                            : 'text-stone-600 hover:bg-stone-200/50 hover:text-stone-800'
                        )}
                      >
                        <DocumentTextIcon className="h-3 w-3" />
                        <span>
                          {expandedIndex === index ? '收起' : '展开全文'}
                        </span>
                      </button>
                    )}

                    {/* 复制按钮 */}
                    <button
                      onClick={() => handleCopy(resource.content, index)}
                      className={cn(
                        'flex items-center space-x-1 rounded px-2 py-1 font-serif text-xs font-medium transition-colors',
                        isDark
                          ? 'text-stone-400 hover:bg-stone-700 hover:text-stone-200'
                          : 'text-stone-500 hover:bg-stone-100 hover:text-stone-700'
                      )}
                    >
                      <ClipboardDocumentIcon className="h-3 w-3" />
                      <span>{copiedIndex === index ? '已复制' : '复制'}</span>
                    </button>
                  </div>

                  {/* 页码信息（如果有） */}
                  {resource.page && (
                    <span
                      className={cn(
                        'font-serif text-xs',
                        isDark ? 'text-stone-500' : 'text-stone-400'
                      )}
                    >
                      第 {resource.page} 页
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
