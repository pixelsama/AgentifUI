import { create } from 'zustand';
import { RefObject } from 'react';

// --- BEGIN COMMENT ---
// 定义滚动状态接口
// --- END COMMENT ---
interface ChatScrollState {
  // --- BEGIN COMMENT ---
  // 标记用户是否已手动向上滚动，离开聊天底部。
  // 如果为 true，则禁用自动滚动到底部的行为。
  // --- END COMMENT ---
  userScrolledUp: boolean;
  // --- BEGIN COMMENT ---
  // 更新 userScrolledUp 状态的方法。
  // --- END COMMENT ---
  setUserScrolledUp: (scrolledUp: boolean) => void;
  isAtBottom: boolean;
  setIsAtBottom: (isBottom: boolean) => void;
  scrollRef: RefObject<HTMLElement> | null;
  setScrollRef: (ref: RefObject<HTMLElement>) => void;
  scrollToBottom: (behavior?: ScrollBehavior) => void;
  // 添加重置滚动状态的方法
  resetScrollState: () => void;
}

// --- BEGIN COMMENT ---
// 创建 Zustand store 来管理聊天滚动状态。
// --- END COMMENT ---
export const useChatScrollStore = create<ChatScrollState>((set, get) => ({
  // --- BEGIN COMMENT ---
  // 初始状态：默认用户在底部，自动滚动是激活的。
  // --- END COMMENT ---
  userScrolledUp: false,
  isAtBottom: true,
  scrollRef: null,
  // --- BEGIN COMMENT ---
  // 实现状态更新方法。
  // --- END COMMENT ---
  setUserScrolledUp: (scrolledUp) => {
    // console.log(`[ChatScrollStore] Setting userScrolledUp to: ${scrolledUp}`); // 可以取消注释用于调试
    set({ userScrolledUp: scrolledUp });
  },
  setIsAtBottom: (isBottom) => set({ isAtBottom: isBottom }),
  setScrollRef: (ref) => set({ scrollRef: ref }),
  
  // 增强版 scrollToBottom 方法，确保一定会滚动到底部
  scrollToBottom: (behavior = 'auto') => {
    const { scrollRef } = get();
    if (scrollRef?.current) {
      // 加入setTimeout确保在DOM更新后执行
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTo({
            top: scrollRef.current.scrollHeight,
            behavior: behavior
          });
          set({ userScrolledUp: false, isAtBottom: true });
        }
      }, 0);
    }
  },
  
  // 添加一个新方法，用于关键事件后重置滚动状态
  resetScrollState: () => {
    set({ userScrolledUp: false, isAtBottom: true });
    const { scrollRef } = get();
    if (scrollRef?.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }
})); 