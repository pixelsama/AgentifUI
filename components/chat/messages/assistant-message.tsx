"use client"

import React from "react"
import { cn } from "@lib/utils"
import { useTheme } from "@lib/hooks"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import rehypeRaw from "rehype-raw"
import "katex/dist/katex.min.css"
import type { Components } from "react-markdown"

interface AssistantMessageProps {
  content: string
  className?: string
}

export const AssistantMessage: React.FC<AssistantMessageProps> = ({ content, className }) => {
  const { isDark } = useTheme()
  
  const markdownComponents: Components = {
    code({ className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '')
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
      )
    },
    table({ className, children, ...props }: any) {
      return (
        <div className="overflow-x-auto my-4">
          <table className={cn("min-w-full divide-y", isDark ? "divide-gray-700" : "divide-gray-200")} {...props}>
            {children}
          </table>
        </div>
      )
    },
    th({ className, children, ...props }: any) {
      return (
        <th 
          className={cn("px-4 py-2 text-left", isDark ? "bg-gray-800" : "bg-gray-100")} 
          {...props}
        >
          {children}
        </th>
      )
    },
    td({ className, children, ...props }: any) {
      return (
        <td 
          className={cn("px-4 py-2 border-t", isDark ? "border-gray-700" : "border-gray-200")} 
          {...props}
        >
          {children}
        </td>
      )
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
      )
    }
  }
  
  return (
    <div className="w-full mb-4">
      <div
        className={cn(
          "w-full py-2 markdown-body",
          isDark 
            ? "text-white" 
            : "text-gray-900",
          className
        )}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeKatex, rehypeRaw]}
          components={markdownComponents}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  )
} 