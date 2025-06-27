"use client"

import React, { useState, useEffect, useRef } from 'react'
import { useTheme } from '@lib/hooks/use-theme'
import { cn } from '@lib/utils'
import { 
  FileText, 
  Play, 
  Square, 
  RefreshCw, 
  RotateCcw, 
  Copy, 
  Download,
  Loader2,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react'
import { useTranslations } from 'next-intl'

interface TextGenerationViewerProps {
  isExecuting: boolean
  isStreaming: boolean
  progress: number
  generatedText: string
  currentExecution: any
  onStop?: () => void
  onRetry?: () => void
  onReset?: () => void
}

/**
 * 文本生成查看器组件
 * 
 * 功能特点：
 * - 实时显示流式文本生成
 * - 进度条显示生成进度
 * - 文本操作（复制、下载）
 * - 执行控制（停止、重试、重置）
 * - 统一的状态面板
 */
export function TextGenerationViewer({
  isExecuting,
  isStreaming,
  progress,
  generatedText,
  currentExecution,
  onStop,
  onRetry,
  onReset
}: TextGenerationViewerProps) {
  const { isDark } = useTheme()
  const [copied, setCopied] = useState(false)
  const textAreaRef = useRef<HTMLTextAreaElement>(null)
  const t = useTranslations('pages.textGeneration')
  
  // --- 自动滚动到底部 ---
  useEffect(() => {
    if (textAreaRef.current && isStreaming) {
      textAreaRef.current.scrollTop = textAreaRef.current.scrollHeight
    }
  }, [generatedText, isStreaming])
  
  // --- 复制文本 ---
  const handleCopyText = async () => {
    if (!generatedText) return
    
    try {
      await navigator.clipboard.writeText(generatedText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Copy failed:', error)
    }
  }
  
  // --- 下载文本 ---
  const handleDownloadText = () => {
    if (!generatedText) return
    
    const blob = new Blob([generatedText], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `generated-text-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
  
  // --- 获取状态信息 ---
  const getStatusInfo = () => {
    if (isExecuting || isStreaming) {
      return {
        icon: <Loader2 className="h-5 w-5 animate-spin text-blue-500" />,
        text: t('status.generating'),
        color: 'text-blue-600'
      }
    }
    
    if (currentExecution?.status === 'completed') {
      return {
        icon: <CheckCircle className="h-5 w-5 text-green-500" />,
        text: t('status.completed'),
        color: 'text-green-600'
      }
    }
    
    if (currentExecution?.status === 'failed') {
      return {
        icon: <XCircle className="h-5 w-5 text-red-500" />,
        text: t('status.failed'),
        color: 'text-red-600'
      }
    }
    
    if (currentExecution?.status === 'stopped') {
      return {
        icon: <Square className="h-5 w-5 text-orange-500" />,
        text: t('status.stopped'),
        color: 'text-orange-600'
      }
    }
    
    return {
      icon: <FileText className="h-5 w-5 text-stone-400" />,
      text: t('status.waiting'),
      color: 'text-stone-500'
    }
  }
  
  const statusInfo = getStatusInfo()
  
  return (
    <div className="h-full flex flex-col">
      {/* --- 控制面板 --- */}
      <div className={cn(
        "flex-shrink-0 p-4 border-b",
        isDark ? "border-stone-700 bg-stone-900/50" : "border-stone-200 bg-stone-50/50"
      )}>
        <div className="flex items-center justify-between">
          {/* 状态信息 */}
          <div className="flex items-center gap-3">
            {statusInfo.icon}
            <div>
              <div className={cn(
                "font-medium font-serif",
                isDark ? "text-stone-200" : "text-stone-800"
              )}>
                {statusInfo.text}
              </div>
              {(isExecuting || isStreaming) && (
                <div className={cn(
                  "text-sm font-serif",
                  isDark ? "text-stone-400" : "text-stone-600"
                )}>
                  {t('progress', { percent: Math.round(progress) })}
                </div>
              )}
            </div>
          </div>
          
          {/* 操作按钮 */}
          <div className="flex items-center gap-2">
            {/* 文本操作按钮 */}
            {generatedText && (
              <>
                <button
                  onClick={handleCopyText}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    isDark
                      ? "hover:bg-stone-700 text-stone-300 hover:text-stone-200"
                      : "hover:bg-stone-200 text-stone-600 hover:text-stone-800"
                  )}
                  title={copied ? t('buttons.copied') : t('buttons.copy')}
                >
                  <Copy className="h-4 w-4" />
                </button>
                
                <button
                  onClick={handleDownloadText}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    isDark
                      ? "hover:bg-stone-700 text-stone-300 hover:text-stone-200"
                      : "hover:bg-stone-200 text-stone-600 hover:text-stone-800"
                  )}
                  title={t('buttons.download')}
                >
                  <Download className="h-4 w-4" />
                </button>
              </>
            )}
            
            {/* 执行控制按钮 */}
            {isExecuting && onStop && (
              <button
                onClick={onStop}
                className={cn(
                  "px-3 py-2 rounded-lg transition-colors font-serif",
                  "bg-red-500 hover:bg-red-600 text-white"
                )}
              >
                <Square className="h-4 w-4 mr-1" />
                {t('buttons.stop')}
              </button>
            )}
            
            {!isExecuting && currentExecution?.status === 'failed' && onRetry && (
              <button
                onClick={onRetry}
                className={cn(
                  "px-3 py-2 rounded-lg transition-colors font-serif",
                  "bg-blue-500 hover:bg-blue-600 text-white"
                )}
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                {t('buttons.retry')}
              </button>
            )}
            
            {!isExecuting && onReset && (
              <button
                onClick={onReset}
                className={cn(
                  "px-3 py-2 rounded-lg transition-colors font-serif",
                  isDark
                    ? "bg-stone-700 hover:bg-stone-600 text-stone-200"
                    : "bg-stone-200 hover:bg-stone-300 text-stone-800"
                )}
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                {t('buttons.reset')}
              </button>
            )}
          </div>
        </div>
        
        {/* 进度条 */}
        {(isExecuting || isStreaming) && (
          <div className="mt-3">
            <div className={cn(
              "w-full h-2 rounded-full overflow-hidden",
              isDark ? "bg-stone-700" : "bg-stone-200"
            )}>
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300 ease-out"
                style={{ width: `${Math.max(progress, 5)}%` }}
              />
            </div>
          </div>
        )}
      </div>
      
      {/* --- 文本显示区域 --- */}
      <div className="flex-1 overflow-hidden">
        {!generatedText && !isExecuting ? (
          // 空状态
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className={cn(
                "w-16 h-16 rounded-full border-2 border-dashed flex items-center justify-center mx-auto",
                isDark ? "border-stone-600" : "border-stone-300"
              )}>
                <FileText className={cn(
                  "h-6 w-6",
                  isDark ? "text-stone-400" : "text-stone-500"
                )} />
              </div>
              <div className="space-y-2">
                <h3 className={cn(
                  "text-lg font-semibold font-serif",
                  isDark ? "text-stone-200" : "text-stone-800"
                )}>
                  {t('emptyState.title')}
                </h3>
                <p className={cn(
                  "text-sm font-serif max-w-md",
                  isDark ? "text-stone-400" : "text-stone-600"
                )}>
                  {t('emptyState.description')}
                </p>
              </div>
            </div>
          </div>
        ) : (
          // 文本显示
          <div className="h-full p-6">
            <textarea
              ref={textAreaRef}
              value={generatedText}
              readOnly
              className={cn(
                "w-full h-full resize-none border-0 bg-transparent focus:outline-none",
                "font-serif text-base leading-relaxed",
                isDark ? "text-stone-200" : "text-stone-800"
              )}
              placeholder={isExecuting ? t('placeholder.generating') : t('placeholder.result')}
            />
            
            {/* 流式生成指示器 */}
            {isStreaming && (
              <div className={cn(
                "absolute bottom-6 right-6 flex items-center gap-2 px-3 py-2 rounded-lg",
                "backdrop-blur-sm border",
                isDark 
                  ? "bg-stone-800/80 border-stone-600 text-stone-300"
                  : "bg-white/80 border-stone-300 text-stone-700"
              )}>
                <div className="flex space-x-1">
                  <div className={cn(
                    "w-2 h-2 rounded-full animate-pulse",
                    "bg-blue-500"
                  )} style={{ animationDelay: '0ms' }} />
                  <div className={cn(
                    "w-2 h-2 rounded-full animate-pulse",
                    "bg-blue-500"
                  )} style={{ animationDelay: '150ms' }} />
                  <div className={cn(
                    "w-2 h-2 rounded-full animate-pulse",
                    "bg-blue-500"
                  )} style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-sm font-serif">{t('streamingIndicator')}</span>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* --- 统计信息 --- */}
      {generatedText && (
        <div className={cn(
          "flex-shrink-0 px-6 py-3 border-t",
          isDark ? "border-stone-700 bg-stone-900/50" : "border-stone-200 bg-stone-50/50"
        )}>
          <div className="flex items-center justify-between text-sm">
            <div className={cn(
              "font-serif",
              isDark ? "text-stone-400" : "text-stone-600"
            )}>
              {t('stats.characters', { count: generatedText.length })}, {t('stats.words', { count: generatedText.split(/\s+/).filter(word => word.length > 0).length })}
            </div>
            
            {currentExecution?.total_tokens && (
              <div className={cn(
                "font-serif",
                isDark ? "text-stone-400" : "text-stone-600"
              )}>
                {t('stats.tokensUsed', { count: currentExecution.total_tokens })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 