import React, { useState, useCallback, useMemo } from 'react'
import { ChevronDownIcon, ChevronUpIcon, DocumentTextIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline'
import { cn } from '@lib/utils'
import { useMobile } from '@lib/hooks/use-mobile'

interface RetrieverResource {
  dataset_name: string
  document_name: string
  content: string
  score: number
  position: number
  word_count?: number
  page?: number | null
  dataset_id?: string
  segment_id?: string
  document_id?: string
}

interface ReferenceSourcesProps {
  retrieverResources?: RetrieverResource[]
  isDark?: boolean
  className?: string
  animationDelay?: number
}

export function ReferenceSources({ 
  retrieverResources, 
  isDark = false, 
  className,
  animationDelay = 0
}: ReferenceSourcesProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const isMobile = useMobile()

  const validResources = useMemo(() => {
    if (!retrieverResources || !Array.isArray(retrieverResources)) {
      return []
    }
    
    return retrieverResources.filter(resource => 
      resource && 
      typeof resource === 'object' &&
      resource.content && 
      resource.document_name &&
      resource.dataset_name
    ).map(resource => ({
      ...resource,
      word_count: resource.word_count || resource.content?.length || 0,
      page: resource.page || null
    }))
  }, [retrieverResources])

  if (validResources.length === 0) {
    return null
  }

  const toggleExpanded = useCallback(() => {
    setIsExpanded(prev => !prev)
    if (isExpanded) {
      setExpandedIndex(null)
    }
  }, [isExpanded])

  const toggleItemExpanded = useCallback((index: number) => {
    setExpandedIndex(prev => prev === index ? null : index)
  }, [])

  const handleCopy = useCallback(async (content: string, index: number) => {
    if (!content) return
    
    try {
      await navigator.clipboard.writeText(content)
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 2000)
    } catch (err) {
      console.error('复制失败:', err)
      try {
        const textArea = document.createElement('textarea')
        textArea.value = content
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        setCopiedIndex(index)
        setTimeout(() => setCopiedIndex(null), 2000)
      } catch (fallbackErr) {
        console.error('降级复制也失败:', fallbackErr)
      }
    }
  }, [])

  const formatScore = useCallback((score: number) => {
    if (typeof score !== 'number' || isNaN(score)) return '0.0%'
    return (score * 100).toFixed(1) + '%'
  }, [])

  const getContentPreview = useCallback((content: string, maxLength = 100) => {
    if (!content || typeof content !== 'string') return ''
    if (content.length <= maxLength) return content
    return content.slice(0, maxLength) + '...'
  }, [])

  return (
    <div className={cn("w-full", className)}>
      <button
        onClick={toggleExpanded}
        className={cn(
          "w-full px-3 py-1.5 flex items-center justify-between",
          "border rounded transition-colors duration-150",
          "focus:outline-none focus:ring-2 focus:ring-offset-1",
          "opacity-0 animate-fade-in",
          isDark 
            ? "bg-stone-800/80 border-stone-700/60 hover:bg-stone-700/80 text-stone-100 focus:ring-stone-500" 
            : "bg-stone-100/90 border-stone-300/70 hover:bg-stone-200/90 text-stone-800 focus:ring-stone-400"
        )}
        style={{
          animationDelay: `${animationDelay}ms`,
          animationFillMode: 'forwards'
        }}
        aria-expanded={isExpanded}
        aria-label={`${isExpanded ? '收起' : '展开'}引用资源`}
      >
        <div className="flex items-center space-x-2">
          {isExpanded ? (
            <ChevronUpIcon className={cn("h-3.5 w-3.5", isDark ? "text-stone-400" : "text-stone-600")} />
          ) : (
            <ChevronDownIcon className={cn("h-3.5 w-3.5", isDark ? "text-stone-400" : "text-stone-600")} />
          )}
          <span className="text-sm font-medium font-serif">
            📚 引用了 {validResources.length} 个知识库资源
          </span>
        </div>
        
        <span className={cn(
          "text-xs px-2 py-0.5 rounded-full font-serif",
          isDark 
            ? "bg-stone-600/80 text-stone-100" 
            : "bg-stone-300/80 text-stone-700"
        )}>
          {validResources[0]?.dataset_name || '知识库'}
        </span>
      </button>

      {isExpanded && (
        <div 
          className={cn(
            "mt-2 border rounded-lg overflow-hidden",
            "transition-all duration-200 ease-out",
            isDark 
              ? "bg-stone-800/50 border-stone-700/50 backdrop-blur-sm" 
              : "bg-stone-100/60 border-stone-300/60 backdrop-blur-sm"
          )}
          style={{
            opacity: 1,
            transform: 'translateY(0)',
            animation: 'fadeIn 200ms ease-out'
          }}
        >
          <div className={cn(
            "divide-y",
            isDark ? "divide-stone-700/30" : "divide-stone-200/30"
          )}>
            {validResources.map((resource, index) => {
              const uniqueKey = `${resource.dataset_id || 'unknown'}-${resource.segment_id || index}-${resource.document_id || index}`
              
              return (
                <div
                  key={uniqueKey}
                  className={cn(
                    "p-4 transition-all duration-200",
                    isDark 
                      ? "hover:bg-stone-800/60" 
                      : "hover:bg-stone-200/70"
                  )}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className={cn(
                        "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
                        isDark ? "bg-stone-600 text-stone-200" : "bg-stone-300 text-stone-700"
                      )}>
                        {index + 1}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className={cn(
                          "text-sm font-semibold font-serif truncate",
                          isDark ? "text-stone-100" : "text-stone-900"
                        )}>
                          {resource.document_name}
                        </h4>
                        <div className="flex items-center space-x-2 mt-0.5">
                          <span className={cn(
                            "text-xs px-1.5 py-0.5 rounded font-serif",
                            isDark 
                              ? "bg-stone-600/50 text-stone-300" 
                              : "bg-stone-300/70 text-stone-600"
                          )}>
                            {resource.dataset_name}
                          </span>
                          {resource.word_count > 0 && (
                            <span className={cn(
                              "text-xs font-serif",
                              isDark ? "text-stone-400" : "text-stone-600"
                            )}>
                              {resource.word_count.toLocaleString()} 字
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className={cn(
                      "flex-shrink-0 px-2 py-1 rounded-full text-xs font-bold font-serif",
                      isDark ? "bg-stone-600 text-stone-200" : "bg-stone-300 text-stone-700"
                    )}>
                      {formatScore(resource.score)}
                    </div>
                  </div>

                  <div className={cn(
                    "rounded-lg p-3 mb-3",
                    isDark 
                      ? "bg-stone-900/50 border border-stone-700/30" 
                      : "bg-white/80 border border-stone-300/60"
                  )}>
                    <div className={cn(
                      "text-sm leading-relaxed font-serif",
                      isDark ? "text-stone-300" : "text-stone-700"
                    )}>
                      {expandedIndex === index ? (
                        <div className="max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-stone-400 scrollbar-track-transparent">
                          <p className="whitespace-pre-wrap">{resource.content}</p>
                        </div>
                      ) : (
                        <p>{getContentPreview(resource.content)}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {resource.content && resource.content.length > 100 && (
                        <button
                          onClick={() => toggleItemExpanded(index)}
                          className={cn(
                            "inline-flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium font-serif",
                            "transition-colors duration-150 focus:outline-none focus:ring-1",
                            isDark 
                              ? "text-stone-400 hover:text-stone-200 hover:bg-stone-700/50 focus:ring-stone-500" 
                              : "text-stone-600 hover:text-stone-800 hover:bg-stone-200/50 focus:ring-stone-400"
                          )}
                          aria-label={expandedIndex === index ? '收起全文' : '展开全文'}
                        >
                          <DocumentTextIcon className="h-3 w-3" />
                          <span>{expandedIndex === index ? '收起' : '展开全文'}</span>
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleCopy(resource.content, index)}
                        className={cn(
                          "flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium transition-colors font-serif",
                          "focus:outline-none focus:ring-1",
                          isDark 
                            ? "text-stone-400 hover:text-stone-200 hover:bg-stone-700 focus:ring-stone-500" 
                            : "text-stone-500 hover:text-stone-700 hover:bg-stone-100 focus:ring-stone-400"
                        )}
                        disabled={!resource.content}
                        aria-label="复制内容"
                      >
                        <ClipboardDocumentIcon className="h-3 w-3" />
                        <span>
                          {copiedIndex === index ? '已复制' : '复制'}
                        </span>
                      </button>
                    </div>
                    
                    {resource.page && (
                      <span className={cn(
                        "text-xs font-serif",
                        isDark ? "text-stone-500" : "text-stone-400"
                      )}>
                        第 {resource.page} 页
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}