import { create } from 'zustand';

// 获取当前路由的工具函数
// 支持SSR环境，避免hydration错误
const getCurrentRoute = (): string => {
  if (typeof window !== 'undefined') {
    return window.location.pathname;
  }
  return 'default'; // SSR环境下的默认路由
};

interface ChatInputState {
  // 🎯 新增：按路由存储消息内容
  // 每个路由维护独立的输入框内容，提升用户体验
  messagesByRoute: Record<string, string>;
  currentRoute: string;

  // 🎯 兼容接口：保持原有API不变
  // 通过函数方式获取当前路由的消息
  message: string; // 改为普通属性，通过computed更新
  getMessage: () => string; // 手动getter函数
  setMessage: (message: string) => void;
  clearMessage: () => void;

  // 🎯 新增：路由管理功能
  setCurrentRoute: (route: string) => void;
  clearAllMessages: () => void;
  clearRouteMessage: (route: string) => void;

  // 输入法状态
  isComposing: boolean;
  setIsComposing: (isComposing: boolean) => void;

  // 聊天界面状态
  isWelcomeScreen: boolean;
  setIsWelcomeScreen: (isWelcome: boolean) => void;

  // 暗黑模式
  isDark: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (isDark: boolean) => void;
}

export const useChatInputStore = create<ChatInputState>((set, get) => ({
  // 🎯 新增：按路由存储的消息内容
  messagesByRoute: {},
  currentRoute: getCurrentRoute(),

  // 🎯 兼容接口：message属性
  // 返回当前路由的消息内容，如果没有则返回空字符串
  message: '',

  getMessage: () => {
    const state = get();
    return state.messagesByRoute[state.currentRoute] || '';
  },

  // 🎯 兼容接口：setMessage
  // 设置当前路由的消息内容，防止重复更新
  setMessage: (message: string) => {
    const state = get();
    const currentMessage = state.messagesByRoute[state.currentRoute] || '';

    // 防止与当前值相同的更新，避免不必要的状态变化
    if (currentMessage === message) return;

    set(state => ({
      messagesByRoute: {
        ...state.messagesByRoute,
        [state.currentRoute]: message,
      },
      // 同时更新message属性以保持兼容性
      message: message,
    }));
  },

  // 🎯 兼容接口：clearMessage
  // 清空当前路由的消息内容
  clearMessage: () => {
    const state = get();
    set(state => ({
      messagesByRoute: {
        ...state.messagesByRoute,
        [state.currentRoute]: '',
      },
      // 同时更新message属性以保持兼容性
      message: '',
    }));
  },

  // 🎯 新增：路由管理功能
  setCurrentRoute: (route: string) => {
    const state = get();
    if (state.currentRoute !== route) {
      // 切换路由时，更新message属性为新路由的内容
      const newMessage = state.messagesByRoute[route] || '';
      set({
        currentRoute: route,
        message: newMessage,
      });
    }
  },

  clearAllMessages: () => {
    set({
      messagesByRoute: {},
      message: '',
    });
  },

  clearRouteMessage: (route: string) => {
    set(state => {
      const newMessages = { ...state.messagesByRoute };
      delete newMessages[route];

      // 如果删除的是当前路由，也要更新message
      const newMessage = route === state.currentRoute ? '' : state.message;

      return {
        messagesByRoute: newMessages,
        message: newMessage,
      };
    });
  },

  // 输入法状态
  isComposing: false,
  setIsComposing: (isComposingValue: boolean) => {
    if (get().isComposing !== isComposingValue) {
      set({ isComposing: isComposingValue });
    }
  },

  // 聊天界面状态
  isWelcomeScreen: true,
  setIsWelcomeScreen: isWelcome => set({ isWelcomeScreen: isWelcome }),

  // 暗黑模式
  isDark: false,
  toggleDarkMode: () => set(state => ({ isDark: !state.isDark })),
  setDarkMode: isDark => set({ isDark }),
}));
