'use client';

import { Button } from '@components/ui/button';
import { cn } from '@lib/utils';
import {
  Bold,
  Code,
  Italic,
  Link,
  List,
  ListOrdered,
  Quote,
  Strikethrough,
  Type,
  Underline,
} from 'lucide-react';

import { useCallback, useRef, useState } from 'react';

interface RichTextEditorProps {
  /** Current content value */
  value: string;
  /** Change handler */
  onChange: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Whether editor is disabled */
  disabled?: boolean;
  /** Custom className */
  className?: string;
  /** Minimum height */
  minHeight?: number;
  /** Maximum height */
  maxHeight?: number;
}

interface ToolbarButton {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  action: () => void;
  isActive?: boolean;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = '输入内容...',
  disabled = false,
  className,
  minHeight = 200,
  maxHeight = 500,
}: RichTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [selectionStart, setSelectionStart] = useState(0);
  const [selectionEnd, setSelectionEnd] = useState(0);

  // Update selection range when textarea selection changes
  const handleSelectionChange = useCallback(() => {
    if (textareaRef.current) {
      setSelectionStart(textareaRef.current.selectionStart);
      setSelectionEnd(textareaRef.current.selectionEnd);
    }
  }, []);

  // Insert text at current cursor position
  const insertText = useCallback(
    (before: string, after: string = '', placeholder: string = '') => {
      if (!textareaRef.current) return;

      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = value.substring(start, end);

      let newText: string;
      let newCursorPosition: number;

      if (selectedText) {
        // Wrap selected text
        newText =
          value.substring(0, start) +
          before +
          selectedText +
          after +
          value.substring(end);
        newCursorPosition =
          start + before.length + selectedText.length + after.length;
      } else {
        // Insert placeholder text
        const insertText = placeholder || '文本';
        newText =
          value.substring(0, start) +
          before +
          insertText +
          after +
          value.substring(end);
        newCursorPosition = start + before.length + insertText.length;
      }

      onChange(newText);

      // Restore cursor position
      setTimeout(() => {
        if (textarea) {
          textarea.focus();
          textarea.setSelectionRange(newCursorPosition, newCursorPosition);
        }
      }, 0);
    },
    [value, onChange]
  );

  // Insert text at current cursor position (simple version)
  const insertSimpleText = useCallback(
    (text: string) => {
      if (!textareaRef.current) return;

      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      const newText = value.substring(0, start) + text + value.substring(end);
      onChange(newText);

      // Restore cursor position
      setTimeout(() => {
        if (textarea) {
          textarea.focus();
          const newPosition = start + text.length;
          textarea.setSelectionRange(newPosition, newPosition);
        }
      }, 0);
    },
    [value, onChange]
  );

  // Format selected text or insert formatted placeholder
  const formatText = useCallback(
    (format: string) => {
      switch (format) {
        case 'bold':
          insertText('**', '**', '粗体文本');
          break;
        case 'italic':
          insertText('*', '*', '斜体文本');
          break;
        case 'underline':
          insertText('<u>', '</u>', '下划线文本');
          break;
        case 'strikethrough':
          insertText('~~', '~~', '删除线文本');
          break;
        case 'code':
          insertText('`', '`', '代码');
          break;
        case 'quote':
          insertText('> ', '', '引用文本');
          break;
        case 'link':
          insertText('[', '](https://example.com)', '链接文本');
          break;
        case 'list':
          insertText('- ', '', '列表项');
          break;
        case 'orderedList':
          insertText('1. ', '', '有序列表项');
          break;
        case 'heading1':
          insertText('# ', '', '一级标题');
          break;
        case 'heading2':
          insertText('## ', '', '二级标题');
          break;
        case 'heading3':
          insertText('### ', '', '三级标题');
          break;
        default:
          break;
      }
    },
    [insertText]
  );

  // Toolbar configuration
  const toolbarButtons: ToolbarButton[] = [
    {
      icon: Type,
      label: '标题',
      action: () => formatText('heading2'),
    },
    {
      icon: Bold,
      label: '粗体',
      action: () => formatText('bold'),
    },
    {
      icon: Italic,
      label: '斜体',
      action: () => formatText('italic'),
    },
    {
      icon: Underline,
      label: '下划线',
      action: () => formatText('underline'),
    },
    {
      icon: Strikethrough,
      label: '删除线',
      action: () => formatText('strikethrough'),
    },
    {
      icon: Code,
      label: '代码',
      action: () => formatText('code'),
    },
    {
      icon: Quote,
      label: '引用',
      action: () => formatText('quote'),
    },
    {
      icon: Link,
      label: '链接',
      action: () => formatText('link'),
    },
    {
      icon: List,
      label: '无序列表',
      action: () => formatText('list'),
    },
    {
      icon: ListOrdered,
      label: '有序列表',
      action: () => formatText('orderedList'),
    },
  ];

  // Quick insert buttons
  const quickInsertButtons = [
    { label: '分隔线', text: '\n---\n' },
    { label: '换行', text: '\n\n' },
    { label: '代码块', text: '\n```\n代码内容\n```\n' },
    {
      label: '表格',
      text: '\n| 列1 | 列2 | 列3 |\n|-----|-----|-----|\n| 内容 | 内容 | 内容 |\n',
    },
  ];

  return (
    <div
      className={cn(
        'rounded-lg border border-stone-300 dark:border-stone-600',
        className
      )}
    >
      {/* Toolbar */}
      <div className="flex items-center gap-1 rounded-t-lg border-b border-stone-200 bg-stone-50 p-2 dark:border-stone-700 dark:bg-stone-800">
        {toolbarButtons.map((button, index) => {
          const Icon = button.icon;
          return (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              onClick={button.action}
              disabled={disabled}
              className="h-8 w-8 p-0"
              title={button.label}
            >
              <Icon className="h-4 w-4" />
            </Button>
          );
        })}

        {/* Divider */}
        <div className="mx-1 h-6 w-px bg-stone-300 dark:bg-stone-600" />

        {/* Quick Insert */}
        {quickInsertButtons.map((button, index) => (
          <Button
            key={index}
            variant="ghost"
            size="sm"
            onClick={() => insertSimpleText(button.text)}
            disabled={disabled}
            className="h-8 px-2 text-xs"
            title={`插入${button.label}`}
          >
            {button.label}
          </Button>
        ))}
      </div>

      {/* Editor */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => onChange(e.target.value)}
          onSelect={handleSelectionChange}
          onKeyUp={handleSelectionChange}
          onMouseUp={handleSelectionChange}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'w-full resize-none border-0 bg-transparent p-4 text-sm',
            'placeholder:text-stone-400 dark:placeholder:text-stone-500',
            'focus:ring-0 focus:outline-none',
            'font-mono leading-relaxed'
          )}
          style={{
            minHeight: `${minHeight}px`,
            maxHeight: `${maxHeight}px`,
            height: 'auto',
          }}
          rows={Math.max(10, value.split('\n').length)}
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between rounded-b-lg border-t border-stone-200 bg-stone-50 px-4 py-2 text-xs text-stone-500 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-400">
        <div className="flex items-center gap-4">
          <span>字符数: {value.length}</span>
          <span>行数: {value.split('\n').length}</span>
          <span>选中: {selectionEnd - selectionStart}</span>
        </div>
        <div className="text-stone-400 dark:text-stone-500">
          支持 Markdown 格式
        </div>
      </div>
    </div>
  );
}

// Preview component for markdown content
interface MarkdownPreviewProps {
  content: string;
  className?: string;
}

export function MarkdownPreview({ content, className }: MarkdownPreviewProps) {
  // Simple markdown to HTML conversion (for basic preview)
  const processMarkdown = (text: string): string => {
    return (
      text
        // Headers
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        // Bold
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Italic
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        // Underline
        .replace(/<u>(.*?)<\/u>/g, '<u>$1</u>')
        // Strikethrough
        .replace(/~~(.*?)~~/g, '<s>$1</s>')
        // Code
        .replace(/`(.*?)`/g, '<code>$1</code>')
        // Links
        .replace(
          /\[([^\]]+)\]\(([^)]+)\)/g,
          '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
        )
        // Line breaks
        .replace(/\n/g, '<br>')
        // Quotes
        .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
        // Unordered lists
        .replace(/^- (.*$)/gim, '<li>$1</li>')
        // Ordered lists
        .replace(/^\d+\. (.*$)/gim, '<li>$1</li>')
        // Horizontal rules
        .replace(/^---$/gim, '<hr>')
    );
  };

  return (
    <div
      className={cn(
        'prose prose-sm dark:prose-invert max-w-none',
        'prose-headings:text-stone-900 dark:prose-headings:text-gray-100',
        'prose-p:text-stone-700 dark:prose-p:text-stone-300',
        'prose-a:text-blue-600 dark:prose-a:text-blue-400',
        'prose-code:text-red-600 dark:prose-code:text-red-400',
        'prose-code:bg-stone-100 dark:prose-code:bg-stone-800',
        'prose-blockquote:border-l-blue-500 prose-blockquote:bg-blue-50 dark:prose-blockquote:bg-blue-900/20',
        className
      )}
      dangerouslySetInnerHTML={{ __html: processMarkdown(content) }}
    />
  );
}

export default RichTextEditor;
