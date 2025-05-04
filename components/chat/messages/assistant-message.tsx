"use client"

import React, { useState, useMemo, useEffect, useRef } from "react"
import { cn } from "@lib/utils"
import { useTheme } from "@lib/hooks"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import rehypeRaw from "rehype-raw"
import "katex/dist/katex.min.css"
import type { Components } from "react-markdown"
import { ThinkBlockHeader } from "@components/chat/markdown-block/think-block-header"
import { ThinkBlockContent } from "@components/chat/markdown-block/think-block-content"
import { AnimatePresence } from "framer-motion"

const extractThinkContent = (rawContent: string): {
  hasThinkBlock: boolean;
  thinkContent: string;
  mainContent: string;
  thinkClosed: boolean;
} => {
  const thinkStartTag = '<think>';
  const thinkEndTag = '</think>';

  if (rawContent.startsWith(thinkStartTag)) {
    const endTagIndex = rawContent.indexOf(thinkEndTag);
    if (endTagIndex !== -1) {
      const thinkContent = rawContent.substring(thinkStartTag.length, endTagIndex);
      const mainContent = rawContent.substring(endTagIndex + thinkEndTag.length);
      return { hasThinkBlock: true, thinkContent, mainContent, thinkClosed: true };
    }
    const thinkContent = rawContent.substring(thinkStartTag.length);
    return { hasThinkBlock: true, thinkContent, mainContent: '', thinkClosed: false };
  }
  return { hasThinkBlock: false, thinkContent: '', mainContent: rawContent, thinkClosed: false };
};

interface AssistantMessageProps {
  content: string
  isStreaming: boolean
  className?: string
}

export const AssistantMessage: React.FC<AssistantMessageProps> = ({ 
  content, 
  isStreaming,
  className 
}) => {
  const { isDark } = useTheme();

  const { hasThinkBlock, thinkContent, mainContent } = useMemo(() => 
    extractThinkContent(content),
    [content]
  );

  const [isOpen, setIsOpen] = useState(true);
  const [isThinking, setIsThinking] = useState(false);
  const prevIsThinkingRef = useRef(isThinking);

  useEffect(() => {
    const shouldBeThinking = hasThinkBlock && !extractThinkContent(content).thinkClosed;
    
    if (shouldBeThinking !== isThinking) {
      setIsThinking(shouldBeThinking);
    }
    
    if (prevIsThinkingRef.current && !shouldBeThinking) {
      setIsOpen(false);
    }
    else if (!prevIsThinkingRef.current && shouldBeThinking) {
      setIsOpen(true);
    }

    prevIsThinkingRef.current = shouldBeThinking;
    
  }, [content, isThinking]);

  const toggleOpen = () => {
    setIsOpen((prev) => !prev);
  };

  const mainMarkdownComponents: Components = {
    code({ className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '');
      return !className?.includes('language-') ? (
        <code className={cn("px-1 py-0.5 rounded", isDark ? "bg-gray-800" : "bg-gray-100")} {...props}>
          {children}
        </code>
      ) : (
        <pre className={cn("rounded-md p-4 my-2", isDark ? "bg-gray-800" : "bg-gray-100")}>
          <code className={className} {...props}>
            {children}
          </code>
        </pre>
      );
    },
    table({ className, children, ...props }: any) {
      return (
        <div className="overflow-x-auto my-4">
          <table className={cn("min-w-full divide-y", isDark ? "divide-gray-700" : "divide-gray-200")} {...props}>
            {children}
          </table>
        </div>
      );
    },
    th({ className, children, ...props }: any) {
      return (
        <th 
          className={cn("px-4 py-2 text-left", isDark ? "bg-gray-800" : "bg-gray-100")} 
          {...props}
        >
          {children}
        </th>
      );
    },
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
    blockquote({ className, children, ...props }: any) {
      return (
        <blockquote 
          className={cn(
            "pl-4 border-l-4 my-4", 
            isDark ? "border-gray-600 bg-gray-800/50" : "border-gray-300 bg-gray-100/50"
          )} 
          {...props}
        >
          {children}
        </blockquote>
      );
    }
  };

  return (
    <div className={cn("w-full mb-4 assistant-message-container", className)}>
      {hasThinkBlock && (
        <ThinkBlockHeader 
          isThinking={isThinking} 
          isOpen={isOpen} 
          onToggle={toggleOpen} 
        />
      )}

      {hasThinkBlock && (
        <ThinkBlockContent 
          markdownContent={thinkContent}
          isOpen={isOpen}
        />
      )}

      {mainContent && (
        <div className={cn(
          "w-full markdown-body main-content-area",
          isDark ? "text-white" : "text-gray-900",
          hasThinkBlock ? (isOpen ? "mt-2" : "") : "py-2"
        )}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex, rehypeRaw]}
            components={mainMarkdownComponents} 
            children={mainContent}
          />
        </div>
      )}
    </div>
  );
}; 