import { useTheme as useNextTheme } from 'next-themes'; // 别名导入以区分
import { useEffect, useState } from 'react';

// --- BEGIN COMMENT ---
// 自定义 useTheme Hook
// 内部封装了 next-themes 的 useTheme Hook，提供与项目之前使用习惯兼容的接口
// 并处理了客户端水合问题以确保 isDark 状态在初始渲染时的正确性
// --- END COMMENT ---
export function useTheme() {
  const { 
    theme, // 当前设置的主题 ('light', 'dark', 或 'system')
    setTheme, // 用于设置主题的函数 ('light', 'dark', 'system')
    resolvedTheme, // 实际解析并应用的主题 ('light' 或 'dark')，会解析 'system'
    systemTheme // 用户的系统偏好 ('light' 或 'dark')
  } = useNextTheme();

  // --- BEGIN COMMENT ---
  // 状态用于跟踪组件是否已在客户端挂载
  // 这是为了防止在 React 水合（hydration）完成前计算 isDark
  // 从而避免服务端和客户端初始渲染不一致导致的警告或界面闪烁
  // --- END COMMENT ---
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // --- BEGIN COMMENT ---
  // 计算 isDark 状态
  // 仅在组件挂载后 (mounted 为 true) 才进行计算
  // 在挂载前返回 false 作为默认值，避免 undefined 导致的类型错误
  // --- END COMMENT ---
  const isDark = mounted ? resolvedTheme === 'dark' : false;

  // --- BEGIN COMMENT ---
  // 提供一个便捷的切换函数，用于在亮色和暗色之间切换
  // 使用 resolvedTheme 判断当前实际应用的主题来进行切换
  // --- END COMMENT ---
  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  // 返回一个包含主题相关状态和操作的对象
  return {
    theme, // 当前设置 ('light', 'dark', 'system')
    setTheme, // 设置主题函数
    resolvedTheme, // 实际应用的主题 ('light', 'dark')
    isDark, // 是否为暗色模式 (仅在客户端挂载后有效)
    toggleTheme // 切换亮/暗模式函数
  };
} 