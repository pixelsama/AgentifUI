import { useState, useEffect } from 'react'

export function useMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // 初始检测
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768) // 常用的移动设备断点
    }
    
    // 监听窗口大小变化
    window.addEventListener('resize', checkMobile)
    
    // 首次运行
    checkMobile()
    
    // 清理监听器
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return isMobile
} 