'use client';

import { cn } from '@lib/utils';
import { CodeIcon } from 'lucide-react';

import React from 'react';

import { CopyButton } from './copy-button';
import { ExportButton } from './export-button';

interface CodeBlockHeaderProps {
  language: string | null;
  className?: string;
  codeContent?: string; // 代码内容属性用于复制功能
}

// 使用 React.memo 包装组件，防止不必要的重新渲染

// 使用 React.memo 包装组件，防止不必要的重新渲染
export const CodeBlockHeader: React.FC<CodeBlockHeaderProps> = React.memo(
  ({ language, className, codeContent }) => {
    // 注意：复制功能已移至CopyButton组件中

    // 注意：这个组件只处理头部UI和复制功能，不影响代码高亮

    if (!language) {
      return null; // Don't render header if language is not specified
    }

    return (
      <div
        className={cn(
          'flex transform-gpu items-center justify-between rounded-t-lg border-b px-3 py-1', // 降低头部高度
          className
        )}
        style={{
          backgroundColor: 'var(--md-code-header-bg)',
          borderColor: 'var(--md-code-header-border)',
          color: 'var(--md-code-header-text)',
        }}
      >
        <div className="flex items-center gap-1.5">
          <CodeIcon className="h-3.5 w-3.5" />
          <span className="text-xs font-medium tracking-wide select-none">
            {language.charAt(0).toUpperCase() + language.slice(1)}
          </span>
        </div>

        {/* Button group: export button on left, copy button on right */}
        {/* Uses flex layout with moderate spacing to maintain visual balance */}
        {codeContent && (
          <div className="flex items-center gap-1">
            {/* 导出按钮 */}
            <ExportButton
              content={codeContent}
              language={language}
              tooltipPlacement="bottom"
            />

            {/* 复制按钮 */}
            <CopyButton content={codeContent} tooltipPlacement="bottom" />
          </div>
        )}
      </div>
    );
  }
);

CodeBlockHeader.displayName = 'CodeBlockHeader';
