import { create } from 'zustand';
import { RefObject } from 'react';

// --- BEGIN COMMENT ---
// 简化的滚动状态接口
// 专注于核心功能：自动滚动和用户控制
// --- END COMMENT ---
interface ChatScrollState {
  // --- 核心状态 ---
  // --- BEGIN COMMENT ---
  // 滚动容器引用
  // --- END COMMENT ---
  scrollRef: RefObject<HTMLElement> | null;
  
  // --- BEGIN COMMENT ---
  // 用户是否主动向上滚动（暂停自动滚动）
  // --- END COMMENT ---
  userScrolledUp: boolean;
  
  // --- BEGIN COMMENT ---
  // 是否在底部
  // --- END COMMENT ---
  isAtBottom: boolean;
  
  // --- BEGIN COMMENT ---
  // 是否正在程序化滚动（避免触发用户滚动事件）
  // --- END COMMENT ---
  isProgrammaticScrolling: boolean;
  
  // --- 操作方法 ---
  setScrollRef: (ref: RefObject<HTMLElement>) => void;
  
  // --- BEGIN COMMENT ---
  // 滚动到底部 - 核心方法
  // --- END COMMENT ---
  scrollToBottom: (behavior?: ScrollBehavior) => void;
  
  // --- BEGIN COMMENT ---
  // 强制滚动到底部（忽略用户状态）
  // --- END COMMENT ---
  forceScrollToBottom: (behavior?: ScrollBehavior) => void;
  
  // --- BEGIN COMMENT ---
  // 处理用户滚动事件
  // --- END COMMENT ---
  handleUserScroll: () => void;
  
  // --- BEGIN COMMENT ---
  // 重置状态
  // --- END COMMENT ---
  reset: () => void;
}

// --- BEGIN COMMENT ---
// 滚动阈值：距离底部多少像素被认为是"在底部"
// --- END COMMENT ---
const SCROLL_THRESHOLD = 100;

// --- BEGIN COMMENT ---
// 创建简化的滚动状态管理Store
// --- END COMMENT ---
export const useChatScrollStore = create<ChatScrollState>((set, get) => ({
  // --- 初始状态 ---
  scrollRef: null,
  userScrolledUp: false,
  isAtBottom: true,
  isProgrammaticScrolling: false,
  
  // --- 设置滚动容器引用 ---
  setScrollRef: (ref) => {
    set({ scrollRef: ref });
  },
  
  // --- BEGIN COMMENT ---
  // 滚动到底部 - 只有在用户没有向上滚动时才执行
  // --- END COMMENT ---
  scrollToBottom: (behavior = 'smooth') => {
    const { scrollRef, userScrolledUp } = get();
    
    // --- BEGIN COMMENT ---
    // 如果用户已向上滚动，不自动滚动
    // --- END COMMENT ---
    if (userScrolledUp) {
      return;
    }
    
    if (scrollRef?.current) {
      set({ isProgrammaticScrolling: true });
      
      requestAnimationFrame(() => {
        const element = scrollRef.current;
        if (element) {
          element.scrollTo({
            top: element.scrollHeight,
            behavior: behavior
          });
          
          // --- BEGIN COMMENT ---
          // 滚动完成后更新状态
          // --- END COMMENT ---
          setTimeout(() => {
            set({ 
              isProgrammaticScrolling: false,
              isAtBottom: true,
              userScrolledUp: false
            });
          }, behavior === 'smooth' ? 300 : 0);
        } else {
          set({ isProgrammaticScrolling: false });
        }
      });
    }
  },
  
  // --- BEGIN COMMENT ---
  // 强制滚动到底部 - 忽略用户状态，总是滚动
  // --- END COMMENT ---
  forceScrollToBottom: (behavior = 'auto') => {
    const { scrollRef } = get();
    
    if (scrollRef?.current) {
      set({ isProgrammaticScrolling: true });
      
      requestAnimationFrame(() => {
        const element = scrollRef.current;
        if (element) {
          element.scrollTo({
            top: element.scrollHeight,
            behavior: behavior
          });
          
          // --- BEGIN COMMENT ---
          // 强制滚动后重置所有状态
          // --- END COMMENT ---
          setTimeout(() => {
            set({ 
              isProgrammaticScrolling: false,
              isAtBottom: true,
              userScrolledUp: false
            });
          }, behavior === 'smooth' ? 300 : 0);
        } else {
          set({ isProgrammaticScrolling: false });
        }
      });
    }
  },
  
  // --- BEGIN COMMENT ---
  // 处理用户滚动事件
  // --- END COMMENT ---
  handleUserScroll: () => {
    const { scrollRef, isProgrammaticScrolling } = get();
    
    // --- BEGIN COMMENT ---
    // 如果是程序化滚动，忽略
    // --- END COMMENT ---
    if (isProgrammaticScrolling || !scrollRef?.current) {
      return;
    }
    
    const element = scrollRef.current;
    const { scrollTop, scrollHeight, clientHeight } = element;
    
    // --- BEGIN COMMENT ---
    // 计算是否在底部
    // --- END COMMENT ---
    const isAtBottom = scrollHeight - scrollTop - clientHeight < SCROLL_THRESHOLD;
    
    // --- BEGIN COMMENT ---
    // 更新状态
    // --- END COMMENT ---
    set({
      isAtBottom,
      userScrolledUp: !isAtBottom
    });
  },
  
  // --- BEGIN COMMENT ---
  // 重置所有状态
  // --- END COMMENT ---
  reset: () => {
    set({
      userScrolledUp: false,
      isAtBottom: true,
      isProgrammaticScrolling: false
    });
  }
}));
