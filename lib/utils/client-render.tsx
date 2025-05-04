"use client"

import { useState, useEffect, ReactNode } from 'react'

interface ClientRenderProps {
  children: ReactNode | ((clientProps: { isMounted: boolean }) => ReactNode)
  fallback?: ReactNode
}

/**
 * 客户端专属渲染包装器
 * 
 * 这个组件确保其子组件只在客户端渲染，避免服务器端渲染差异导致的水合错误
 * 
 * @param children 需要在客户端渲染的内容或渲染函数
 * @param fallback 服务器端和初始客户端渲染时显示的内容（可选）
 */
export function ClientRender({ children, fallback = null }: ClientRenderProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return fallback
  }

  return typeof children === 'function'
    ? children({ isMounted })
    : children
}

/**
 * 客户端渲染钩子
 * 
 * 用于检测组件是否已在客户端渲染
 * 可用于条件性地渲染仅客户端内容
 */
export function useIsClient() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return isMounted
} 