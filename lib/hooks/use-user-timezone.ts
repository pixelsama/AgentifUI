'use client';

import { useCallback, useEffect, useState } from 'react';

// 用户时区偏好管理Hook
// 使用localStorage存储用户的时区设置，支持系统时区回退
const TIMEZONE_STORAGE_KEY = 'user-timezone';

// 验证时区是否有效
// 使用Intl.DateTimeFormat来检查时区的有效性
const isValidTimezone = (timezone: string): boolean => {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
};

// 获取系统默认时区
// 作为用户未设置时区时的回退选项
const getSystemTimezone = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'UTC';
  }
};

export function useUserTimezone() {
  const [timezone, setTimezone] = useState<string>(() => {
    // 初始化时区：优先使用用户设置，回退到系统时区
    // 确保在服务器端渲染时返回合理的默认值
    if (typeof window === 'undefined') {
      return 'UTC'; // 服务器端渲染时的默认值
    }

    const savedTimezone = localStorage.getItem(TIMEZONE_STORAGE_KEY);

    if (savedTimezone && isValidTimezone(savedTimezone)) {
      return savedTimezone;
    }

    return getSystemTimezone();
  });

  // 在客户端水合时更新时区
  // 确保服务器端和客户端的一致性
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTimezone = localStorage.getItem(TIMEZONE_STORAGE_KEY);

      if (savedTimezone && isValidTimezone(savedTimezone)) {
        setTimezone(savedTimezone);
      } else {
        const systemTimezone = getSystemTimezone();
        setTimezone(systemTimezone);
        // 将系统时区保存到localStorage作为默认值
        localStorage.setItem(TIMEZONE_STORAGE_KEY, systemTimezone);
      }
    }
  }, []);

  // 更新用户时区设置
  // 同时更新状态和localStorage
  const updateTimezone = useCallback((newTimezone: string) => {
    if (!isValidTimezone(newTimezone)) {
      console.warn(`[useUserTimezone] Invalid timezone: ${newTimezone}`);
      return false;
    }

    setTimezone(newTimezone);

    if (typeof window !== 'undefined') {
      localStorage.setItem(TIMEZONE_STORAGE_KEY, newTimezone);
    }

    return true;
  }, []);

  // 重置为系统时区
  // 清除用户自定义设置，回到系统默认
  const resetToSystemTimezone = useCallback(() => {
    const systemTimezone = getSystemTimezone();
    setTimezone(systemTimezone);

    if (typeof window !== 'undefined') {
      localStorage.setItem(TIMEZONE_STORAGE_KEY, systemTimezone);
    }

    return systemTimezone;
  }, []);

  // 检查当前时区是否为系统时区
  const isSystemTimezone = timezone === getSystemTimezone();

  return {
    timezone,
    updateTimezone,
    resetToSystemTimezone,
    isSystemTimezone,
    systemTimezone: getSystemTimezone(),
  };
}
