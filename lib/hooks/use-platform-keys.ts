'use client';

import { useMemo } from 'react';

export interface PlatformKeys {
  /** 是否为Mac平台 */
  isMac: boolean;
  /** 是否为Windows平台 */
  isWindows: boolean;
  /** 是否为Linux平台 */
  isLinux: boolean;
  /** 修饰键符号 (Mac: ⌘, Others: Ctrl) */
  modifierSymbol: string;
  /** 修饰键文本 (Mac: Cmd, Others: Ctrl) */
  modifierKey: string;
  /** Option/Alt键符号 (Mac: ⌥, Others: Alt) */
  altSymbol: string;
  /** Option/Alt键文本 (Mac: Option, Others: Alt) */
  altKey: string;
  /** Shift键符号 */
  shiftSymbol: string;
  /** 获取格式化的快捷键文本 */
  formatShortcut: (keys: readonly string[]) => string;
  /** 获取格式化的快捷键符号数组 */
  formatShortcutSymbols: (keys: readonly string[]) => string[];
}

/**
 * 平台检测和快捷键Hook
 *
 * 特点：
 * - 基本无性能消耗（仅在初始化时检测一次）
 * - 支持所有主流平台检测
 * - 提供文本和符号两种快捷键格式
 * - SSR安全（服务端渲染时使用默认值）
 *
 * @returns PlatformKeys 平台信息和格式化函数
 */
export function usePlatformKeys(): PlatformKeys {
  return useMemo(() => {
    // SSR安全检查
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      // 服务端渲染时返回默认值（假设为非Mac平台）
      return {
        isMac: false,
        isWindows: false,
        isLinux: false,
        modifierSymbol: 'Ctrl',
        modifierKey: 'Ctrl',
        altSymbol: 'Alt',
        altKey: 'Alt',
        shiftSymbol: 'Shift',
        formatShortcut: (keys: readonly string[]) => keys.join(' + '),
        formatShortcutSymbols: (keys: readonly string[]) => [...keys],
      };
    }

    // 平台检测（优先使用 navigator.platform，fallback 到 userAgent）
    const platform = navigator.platform?.toUpperCase() || '';
    const userAgent = navigator.userAgent || '';

    const isMac =
      platform.includes('MAC') || /Mac|iPhone|iPad|iPod/.test(userAgent);
    const isWindows = platform.includes('WIN') || userAgent.includes('Windows');
    const isLinux = platform.includes('LINUX') || userAgent.includes('Linux');

    // 根据平台返回对应的按键符号和文本
    const platformKeys: PlatformKeys = {
      isMac,
      isWindows,
      isLinux,
      modifierSymbol: isMac ? '⌘' : 'Ctrl',
      modifierKey: isMac ? 'Cmd' : 'Ctrl',
      altSymbol: isMac ? '⌥' : 'Alt',
      altKey: isMac ? 'Option' : 'Alt',
      shiftSymbol: '⇧',

      // 格式化快捷键文本 (如: ["Cmd", "N"] -> "Cmd + N")
      formatShortcut: (keys: readonly string[]) => {
        return keys
          .map(key => {
            // 自动转换修饰键
            if (key.toLowerCase() === 'cmd' || key.toLowerCase() === 'ctrl') {
              return isMac ? 'Cmd' : 'Ctrl';
            }
            if (key.toLowerCase() === 'option' || key.toLowerCase() === 'alt') {
              return isMac ? 'Option' : 'Alt';
            }
            return key;
          })
          .join(' + ');
      },

      // 格式化快捷键符号 (如: ["⌘", "Enter"] -> 返回数组 ["⌘", "⏎"])
      formatShortcutSymbols: (keys: readonly string[]) => {
        return keys.map(key => {
          // 自动转换修饰键符号
          if (key.toLowerCase() === 'cmd' || key.toLowerCase() === 'ctrl') {
            return isMac ? '⌘' : 'Ctrl';
          }
          if (key.toLowerCase() === 'option' || key.toLowerCase() === 'alt') {
            return isMac ? '⌥' : 'Alt';
          }
          if (key.toLowerCase() === 'shift') {
            return '⇧';
          }
          // 特殊按键转换为符号
          if (key.toLowerCase() === 'enter') {
            return '⏎';
          }
          return key;
        });
      },
    };

    return platformKeys;
  }, []); // 空依赖数组，仅在组件挂载时执行一次
}

/**
 * 预定义的常用快捷键组合
 */
export const COMMON_SHORTCUTS = {
  // 基础操作
  NEW: ['Cmd', 'N'],
  SAVE: ['Cmd', 'S'],
  SAVE_SUBMIT: ['Cmd', 'Enter'], // 保存/提交表单
  OPEN: ['Cmd', 'O'],
  CLOSE: ['Cmd', 'W'],
  QUIT: ['Cmd', 'Q'],

  // 编辑操作
  COPY: ['Cmd', 'C'],
  PASTE: ['Cmd', 'V'],
  CUT: ['Cmd', 'X'],
  UNDO: ['Cmd', 'Z'],
  REDO: ['Cmd', 'Shift', 'Z'],
  SELECT_ALL: ['Cmd', 'A'],

  // 查找操作
  FIND: ['Cmd', 'F'],
  FIND_NEXT: ['Cmd', 'G'],
  FIND_PREV: ['Cmd', 'Shift', 'G'],

  // 导航操作
  REFRESH: ['Cmd', 'R'],
  BACK: ['Cmd', 'Left'],
  FORWARD: ['Cmd', 'Right'],
  HOME: ['Cmd', 'Home'],
  END: ['Cmd', 'End'],

  // 界面操作
  TOGGLE_SIDEBAR: ['Cmd', '\\'],
  SETTINGS: ['Cmd', ','],
  TOGGLE_FULLSCREEN: ['Cmd', 'Shift', 'F'],

  // 应用特定
  NEW_TAB: ['Cmd', 'T'],
  CLOSE_TAB: ['Cmd', 'W'],
  NEXT_TAB: ['Cmd', 'Shift', ']'],
  PREV_TAB: ['Cmd', 'Shift', '['],

  // 取消/确认
  CANCEL: ['Escape'],
  SUBMIT: ['Enter'],

  // 应用功能（AgentifUI专用）
  NEW_CHAT: ['Cmd', 'K'],
  RECENT_CHATS: ['Cmd', 'H'], // H for History
  APPS_MARKET: ['Cmd', 'Shift', 'A'],
} as const;

/**
 * 快捷键格式化工具Hook
 *
 * @param shortcutKey COMMON_SHORTCUTS中的键名
 * @returns 格式化后的快捷键对象
 */
export function useFormattedShortcut(
  shortcutKey: keyof typeof COMMON_SHORTCUTS
) {
  const platformKeys = usePlatformKeys();

  return useMemo(() => {
    const keys = COMMON_SHORTCUTS[shortcutKey];
    return {
      keys,
      text: platformKeys.formatShortcut(keys),
      symbols: platformKeys.formatShortcutSymbols(keys),
      platformKeys,
    };
  }, [shortcutKey, platformKeys]);
}
