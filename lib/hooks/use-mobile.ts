import { useState, useEffect } from 'react'

// 定义移动设备断点（与Tailwind md断点一致）
const MOBILE_BREAKPOINT = 768

export function useMobile() {
  // 初始状态设为undefined，避免服务端渲染不匹配问题
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined)

  useEffect(() => {
    // 使用MediaQueryList来监听屏幕尺寸变化
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    // 添加变化监听
    mql.addEventListener("change", onChange)
    
    // 立即检测当前状态
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    
    // 清理监听器
    return () => mql.removeEventListener("change", onChange)
  }, [])

  // 确保返回布尔值（即使初始状态是undefined）
  return !!isMobile
} 