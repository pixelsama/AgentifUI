import { create } from 'zustand';

import { RefObject } from 'react';

// 定义滚动状态接口
interface ChatScrollState {
  // 标记用户是否已手动向上滚动，离开聊天底部。
  // 如果为 true，则禁用自动滚动到底部的行为。
  userScrolledUp: boolean;
  // 更新 userScrolledUp 状态的方法。
  setUserScrolledUp: (scrolledUp: boolean) => void;
  isAtBottom: boolean;
  setIsAtBottom: (isBottom: boolean) => void;
  scrollRef: RefObject<HTMLElement> | null;
  setScrollRef: (ref: RefObject<HTMLElement>) => void;
  scrollToBottom: (behavior?: ScrollBehavior, onScrollEnd?: () => void) => void;
  // 添加重置滚动状态的方法
  resetScrollState: (onScrollEnd?: () => void) => void;
}

// 创建 Zustand store 来管理聊天滚动状态。
export const useChatScrollStore = create<ChatScrollState>((set, get) => ({
  // 初始状态：默认用户在底部，自动滚动是激活的。
  userScrolledUp: false,
  isAtBottom: true,
  scrollRef: null,
  // 实现状态更新方法。
  setUserScrolledUp: scrolledUp => {
    if (get().userScrolledUp !== scrolledUp) {
      set({ userScrolledUp: scrolledUp });
    }
  },
  setIsAtBottom: isBottom => {
    if (get().isAtBottom !== isBottom) {
      set({ isAtBottom: isBottom });
    }
  },
  setScrollRef: ref => {
    if (get().scrollRef !== ref) {
      set({ scrollRef: ref });
    }
  },

  // 🎯 优化：scrollToBottom 方法，更智能地处理状态更新
  scrollToBottom: (behavior = 'auto', onScrollEnd) => {
    const { scrollRef } = get();
    if (scrollRef?.current) {
      requestAnimationFrame(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTo({
            top: scrollRef.current.scrollHeight,
            behavior: behavior,
          });

          // 🎯 修复：延迟状态更新，让滚动事件处理器先执行
          // 这样可以避免覆盖用户的滚动意图
          setTimeout(
            () => {
              // 重新检查当前滚动位置，而不是强制设置
              if (scrollRef.current) {
                const element = scrollRef.current;
                const currentIsAtBottom =
                  element.scrollHeight -
                    element.scrollTop -
                    element.clientHeight <
                  50;

                // 只有确实滚动到底部时才更新状态
                if (currentIsAtBottom) {
                  const currentState = get();
                  if (
                    currentState.userScrolledUp !== false ||
                    currentState.isAtBottom !== true
                  ) {
                    set({ userScrolledUp: false, isAtBottom: true });
                  }
                }
              }

              if (onScrollEnd) {
                onScrollEnd();
              }
            },
            behavior === 'smooth' ? 100 : 0
          ); // 平滑滚动需要更多时间
        } else {
          if (onScrollEnd) {
            onScrollEnd();
          }
        }
      });
    } else {
      if (onScrollEnd) {
        onScrollEnd();
      }
    }
  },

  // 🎯 优化：resetScrollState 方法，用于用户主动点击按钮时的重置
  resetScrollState: onScrollEnd => {
    // 用户主动重置，强制设置状态并滚动
    set({ userScrolledUp: false, isAtBottom: true });

    const { scrollRef } = get();
    if (scrollRef?.current) {
      requestAnimationFrame(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTo({
            top: scrollRef.current.scrollHeight,
            behavior: 'auto',
          });
          if (onScrollEnd) {
            onScrollEnd();
          }
        } else {
          if (onScrollEnd) {
            onScrollEnd();
          }
        }
      });
    } else {
      if (onScrollEnd) {
        onScrollEnd();
      }
    }
  },
}));
